import path from 'node:path';
import request from 'supertest';
import { newDb } from 'pg-mem';
import type { Pool } from 'pg';
import { beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';
import {
  createPgOrderStore,
  createPgProductRepository,
  createPgSubscriptionStore,
  migrate,
  seedProducts,
} from '../src/db.js';
import { buildQuote } from '../src/orders.js';
import { createPushService, resolveVapidKeys } from '../src/push.js';

const root = path.resolve(import.meta.dirname, '..');
const dataDir = path.join(root, 'data');
const migrationsDir = path.join(root, 'migrations');

// pg-mem emulates Postgres in-process, so these run without a database server.
async function freshPool(): Promise<Pool> {
  const { Pool: MemPool } = newDb().adapters.createPg();
  const pool = new MemPool() as Pool;
  await migrate(pool, migrationsDir);
  return pool;
}

describe('postgres: migrations and seeding', () => {
  it('is idempotent and seeds once', async () => {
    const pool = await freshPool();
    await migrate(pool, migrationsDir);
    expect(await seedProducts(pool, dataDir)).toBe(8);
    expect(await seedProducts(pool, dataDir)).toBe(0);
    const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM products');
    expect(rows[0].n).toBe(8);
  });
});

describe('postgres: product repository', () => {
  let repo: ReturnType<typeof createPgProductRepository>;
  beforeAll(async () => {
    const pool = await freshPool();
    await seedProducts(pool, dataDir);
    repo = createPgProductRepository(pool);
  });

  it('maps rows to products with numeric prices', async () => {
    const p = await repo.byId('p001');
    expect(p).toMatchObject({
      name: 'Heritage Wool Sweater',
      price: 129,
      discountPercent: 15,
      inStock: true,
    });
    expect(p?.sizes).toEqual(['S', 'M', 'L', 'XL']);
  });

  it('filters in SQL', async () => {
    expect(await repo.search({})).toHaveLength(8);
    expect(await repo.search({ q: 'sweater' })).toHaveLength(1);
    expect(await repo.search({ category: 'jackets' })).toHaveLength(2);
    expect(await repo.search({ discountedOnly: true })).toHaveLength(5);
    expect((await repo.search({ maxPrice: 60 })).every((p) => p.price <= 60)).toBe(true);
  });

  it('treats LIKE wildcards in the query literally', async () => {
    expect(await repo.search({ q: '%' })).toHaveLength(0);
  });

  it('is safe against SQL injection in filters', async () => {
    expect(await repo.search({ q: "'; DROP TABLE products; --" })).toHaveLength(0);
    expect(await repo.search({})).toHaveLength(8);
  });

  it('loads several ids and facets', async () => {
    expect(await repo.byIds(['p001', 'p002', 'nope'])).toHaveLength(2);
    expect(await repo.byIds([])).toEqual([]);
    expect(await repo.categories()).toContain('Jackets');
    expect((await repo.colors()).length).toBeGreaterThan(0);
  });
});

describe('postgres: orders', () => {
  it('persists an order with its lines and reads it back', async () => {
    const pool = await freshPool();
    await seedProducts(pool, dataDir);
    const products = createPgProductRepository(pool);
    const orders = createPgOrderStore(pool);

    const quote = await buildQuote(products, [
      { productId: 'p001', quantity: 2 },
      { productId: 'p003', quantity: 1 },
    ]);
    const created = await orders.create(quote);
    const fetched = await orders.get(created.id);

    expect(fetched).toEqual(created);
    expect(fetched?.lines).toHaveLength(2);
    expect(fetched?.total).toBe(quote.total);
    expect(await orders.get('missing')).toBeUndefined();
  });
});

describe('postgres: push subscriptions', () => {
  it('upserts, lists and removes', async () => {
    const store = createPgSubscriptionStore(await freshPool());
    const sub = {
      endpoint: 'https://push.example/1',
      expirationTime: null,
      keys: { p256dh: 'k', auth: 'a' },
    };
    await store.add(sub);
    await store.add({ ...sub, keys: { p256dh: 'k2', auth: 'a2' } });
    const all = await store.all();
    expect(all).toHaveLength(1);
    expect(all[0].keys.p256dh).toBe('k2');
    await store.remove(sub.endpoint);
    expect(await store.all()).toHaveLength(0);
  });
});

describe('postgres-backed HTTP API', () => {
  it('serves catalog, orders and readiness from Postgres', async () => {
    const pool = await freshPool();
    await seedProducts(pool, dataDir);
    const app = createApp({
      config: loadConfig({ DATA_DIR: dataDir }),
      products: createPgProductRepository(pool),
      orders: createPgOrderStore(pool),
      push: createPushService(
        resolveVapidKeys({}),
        createPgSubscriptionStore(pool),
        'mailto:a@b.co',
      ),
      ping: async () => void (await pool.query('SELECT 1')),
    });

    expect((await request(app).get('/api/ready')).body.status).toBe('ready');
    expect((await request(app).get('/api/products?q=jacket')).body.length).toBeGreaterThan(0);

    const order = await request(app)
      .post('/api/orders')
      .send({ items: [{ productId: 'p002', quantity: 1 }] });
    expect(order.status).toBe(201);
    expect((await request(app).get(`/api/orders/${order.body.id}`)).body.total).toBe(249);
  });

  it('reports not ready when the database is down', async () => {
    const pool = await freshPool();
    const app = createApp({
      config: loadConfig({ DATA_DIR: dataDir }),
      products: createPgProductRepository(pool),
      orders: createPgOrderStore(pool),
      push: createPushService(
        resolveVapidKeys({}),
        createPgSubscriptionStore(pool),
        'mailto:a@b.co',
      ),
      ping: async () => {
        throw new Error('down');
      },
    });
    expect((await request(app).get('/api/ready')).status).toBe(503);
  });
});
