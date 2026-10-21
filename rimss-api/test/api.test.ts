import path from 'node:path';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';
import { buildQuote, createMemoryOrderStore } from '../src/orders.js';
import { createFileProductRepository } from '../src/products.js';
import type { PushService } from '../src/push.js';

const dataDir = path.resolve(import.meta.dirname, '..', 'data');

const makePush = (): PushService => ({
  publicKey: 'test-public-key',
  subscribe: vi.fn(),
  unsubscribe: vi.fn(),
  broadcast: vi.fn().mockResolvedValue(2),
});

function build(env: Record<string, string> = {}, opts?: { rateLimitMax?: number }) {
  const config = loadConfig({ DATA_DIR: dataDir, LOG_LEVEL: 'silent', ...env });
  const push = makePush();
  const products = createFileProductRepository(dataDir);
  const app = createApp(
    {
      config,
      products,
      orders: createMemoryOrderStore(products),
      push,
    },
    opts,
  );
  return { app, push };
}

describe('catalog', () => {
  const { app } = build();

  it('reports health', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('lists all products', async () => {
    const res = await request(app).get('/api/products');
    expect(res.body).toHaveLength(8);
  });

  it('filters by name, category, price and discount', async () => {
    expect((await request(app).get('/api/products?q=sweater')).body).toHaveLength(1);
    expect((await request(app).get('/api/products?category=jackets')).body).toHaveLength(2);
    expect(
      (await request(app).get('/api/products?maxPrice=60')).body.every(
        (p: { price: number }) => p.price <= 60,
      ),
    ).toBe(true);
    expect((await request(app).get('/api/products?discountedOnly=true')).body).toHaveLength(5);
  });

  it('sorts by price before paging', async () => {
    const prices = (res: { body: { price: number }[] }) => res.body.map((p) => p.price);
    const all = prices(await request(app).get('/api/products'));
    const asc = prices(await request(app).get('/api/products?sort=asc&limit=3'));
    expect(asc).toEqual([...all].sort((a, b) => a - b).slice(0, 3));
    const desc = prices(await request(app).get('/api/products?sort=desc&limit=3'));
    expect(desc).toEqual([...all].sort((a, b) => b - a).slice(0, 3));
  });

  it('paginates with limit and offset and reports the total', async () => {
    const res = await request(app).get('/api/products?limit=3&offset=2');
    expect(res.body).toHaveLength(3);
    expect(res.headers['x-total-count']).toBe('8');
    expect((await request(app).get('/api/products?offset=6')).body).toHaveLength(2);
    expect((await request(app).get('/api/products?limit=0')).status).toBe(400);
  });

  it('rejects invalid filters', async () => {
    const res = await request(app).get('/api/products?maxPrice=abc');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns a product or a 404 envelope', async () => {
    expect((await request(app).get('/api/products/p001')).body.name).toBe('Heritage Wool Sweater');
    const missing = await request(app).get('/api/products/nope');
    expect(missing.status).toBe(404);
    expect(missing.body.error.code).toBe('PRODUCT_NOT_FOUND');
  });

  it('lists categories and colors', async () => {
    expect((await request(app).get('/api/categories')).body).toContain('Jackets');
    expect((await request(app).get('/api/colors')).body.length).toBeGreaterThan(0);
  });

  it('returns 404 for unknown routes', async () => {
    expect((await request(app).get('/api/nope')).status).toBe(404);
  });

  it('serves the OpenAPI spec and Prometheus metrics', async () => {
    expect((await request(app).get('/api/openapi.json')).body.openapi).toBe('3.0.3');
    const metrics = await request(app).get('/metrics');
    expect(metrics.text).toContain('http_requests_total');
  });
});

describe('order payment lifecycle', () => {
  const { app } = build();
  const create = async () =>
    (
      await request(app)
        .post('/api/orders')
        .send({ items: [{ productId: 'p001', quantity: 1 }] })
    ).body.id as string;

  it('pays a pending order and is idempotent', async () => {
    const id = await create();
    expect((await request(app).post(`/api/orders/${id}/pay`)).body.status).toBe('PAID');
    expect((await request(app).post(`/api/orders/${id}/pay`)).body.status).toBe('PAID');
    expect((await request(app).get(`/api/orders/${id}`)).body.status).toBe('PAID');
  });

  it('rejects cancelling a paid order and unknown ids', async () => {
    const id = await create();
    await request(app).post(`/api/orders/${id}/pay`);
    const res = await request(app).post(`/api/orders/${id}/cancel`);
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('INVALID_STATE');
    expect((await request(app).post('/api/orders/nope/pay')).status).toBe(404);
  });

  it('cancels a pending order', async () => {
    const id = await create();
    expect((await request(app).post(`/api/orders/${id}/cancel`)).body.status).toBe('CANCELLED');
  });
});

describe('stock quantity', () => {
  const { app } = build();

  it('rejects quantities above the stock on hand', async () => {
    const res = await request(app)
      .post('/api/cart/quote')
      .send({ items: [{ productId: 'p001', quantity: 30 }] });
    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('INSUFFICIENT_STOCK');
  });

  it('decrements stock on order, blocks overselling and restores on cancel', async () => {
    const { app } = build();
    const stock = async () => (await request(app).get('/api/products/p001')).body.stock as number;
    const start = await stock();
    const place = (quantity: number) =>
      request(app)
        .post('/api/orders')
        .send({ items: [{ productId: 'p001', quantity }] });

    const first = await place(start - 1);
    expect(first.status).toBe(201);
    expect(await stock()).toBe(1);

    const over = await place(2);
    expect(over.status).toBe(409);
    expect(over.body.error.code).toBe('INSUFFICIENT_STOCK');

    await request(app).post(`/api/orders/${first.body.id}/cancel`);
    expect(await stock()).toBe(start);
  });

  it('lets only one of two concurrent orders take the last unit', async () => {
    const { app } = build();
    const start = (await request(app).get('/api/products/p001')).body.stock as number;
    const place = () =>
      request(app)
        .post('/api/orders')
        .send({ items: [{ productId: 'p001', quantity: start }] });
    const statuses = (await Promise.all([place(), place()])).map((r) => r.status).sort();
    expect(statuses).toEqual([201, 409]);
  });
});

describe('guest orders and expiry', () => {
  const items = [{ productId: 'p001', quantity: 1 }];

  it('rejects guest orders when REQUIRE_AUTH_FOR_ORDERS is true', async () => {
    const { app } = build({ REQUIRE_AUTH_FOR_ORDERS: 'true' });
    const res = await request(app).post('/api/orders').send({ items });
    expect(res.status).toBe(401);
  });

  it('cancels stale unpaid orders and restores stock', async () => {
    const products = createFileProductRepository(dataDir);
    const orders = createMemoryOrderStore(products);
    const start = (await products.byIds(['p001']))[0]?.stock as number;
    const order = await orders.create(await buildQuote(products, items));
    expect(await orders.expirePending(new Date(Date.now() - 60_000))).toBe(0);
    expect(await orders.expirePending(new Date(Date.now() + 60_000))).toBe(1);
    expect((await orders.get(order.id))?.status).toBe('CANCELLED');
    expect((await products.byIds(['p001']))[0]?.stock).toBe(start);
  });
});

describe('auth and order history', () => {
  const { app } = build();

  it('sets an httpOnly cookie that authenticates later requests and logout clears it', async () => {
    const agent = request.agent(app);
    const reg = await agent
      .post('/api/auth/register')
      .send({ email: 'cookie@example.com', password: 'correct horse' });
    const cookie = (reg.headers['set-cookie'] as unknown as string[])[0] ?? '';
    expect(cookie).toMatch(/rimss_token=/);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Lax/i);
    expect((await agent.get('/api/orders')).status).toBe(200);
    expect((await request(app).get('/api/orders')).status).toBe(401);
    await agent.post('/api/auth/logout').expect(204);
    expect((await agent.get('/api/orders')).status).toBe(401);
  });
  const creds = { email: 'Shopper@Example.com', password: 'correct horse' };
  const items = [{ productId: 'p001', quantity: 1 }];

  it('registers, rejects duplicates and signs in with the right password only', async () => {
    const reg = await request(app).post('/api/auth/register').send(creds);
    expect(reg.status).toBe(201);
    expect(reg.body.token).toEqual(expect.any(String));
    expect(reg.body.user.email).toBe('shopper@example.com');
    expect((await request(app).post('/api/auth/register').send(creds)).status).toBe(409);
    expect((await request(app).post('/api/auth/login').send(creds)).status).toBe(200);
    const bad = await request(app)
      .post('/api/auth/login')
      .send({ ...creds, password: 'wrong password' });
    expect(bad.status).toBe(401);
    expect(bad.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('validates credentials', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'nope', password: 'short' });
    expect(res.status).toBe(400);
  });

  it('lists only the signed-in user orders and hides them from others', async () => {
    const a = (
      await request(app)
        .post('/api/auth/register')
        .send({ email: 'a@example.com', password: 'password-a' })
    ).body.token;
    const b = (
      await request(app)
        .post('/api/auth/register')
        .send({ email: 'b@example.com', password: 'password-b' })
    ).body.token;
    const order = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${a}`)
      .send({ items });
    await request(app).post('/api/orders').send({ items });

    expect((await request(app).get('/api/orders')).status).toBe(401);
    const mine = await request(app).get('/api/orders').set('Authorization', `Bearer ${a}`);
    expect(mine.body.map((o: { id: string }) => o.id)).toEqual([order.body.id]);
    expect(
      (await request(app).get('/api/orders').set('Authorization', `Bearer ${b}`)).body,
    ).toEqual([]);

    const url = `/api/orders/${order.body.id}`;
    expect((await request(app).get(url).set('Authorization', `Bearer ${a}`)).status).toBe(200);
    expect((await request(app).get(url).set('Authorization', `Bearer ${b}`)).status).toBe(404);
    expect((await request(app).get(url)).status).toBe(404);
    expect((await request(app).post(`${url}/pay`).set('Authorization', `Bearer ${b}`)).status).toBe(
      404,
    );
  });

  it('ignores invalid tokens', async () => {
    const res = await request(app).get('/api/orders').set('Authorization', 'Bearer garbage');
    expect(res.status).toBe(401);
  });
});

describe('pricing and orders', () => {
  const { app } = build();

  it('quotes with server-side prices and merges duplicate lines', async () => {
    const res = await request(app)
      .post('/api/cart/quote')
      .send({
        items: [
          { productId: 'p001', quantity: 1 },
          { productId: 'p001', quantity: 1 },
        ],
      });
    expect(res.status).toBe(200);
    expect(res.body.lines).toHaveLength(1);
    expect(res.body.lines[0].unitPrice).toBe(109.65);
    expect(res.body.total).toBe(219.3);
    expect(res.body.subtotal).toBe(258);
    expect(res.body.discountTotal).toBe(38.7);
  });

  it('ignores client-supplied prices', async () => {
    const res = await request(app)
      .post('/api/cart/quote')
      .send({ items: [{ productId: 'p002', quantity: 1, price: 1 }] });
    expect(res.body.total).toBe(249);
  });

  it('rejects unknown and out-of-stock products', async () => {
    const unknown = await request(app)
      .post('/api/orders')
      .send({ items: [{ productId: 'zzz', quantity: 1 }] });
    expect(unknown.status).toBe(422);
    const oos = await request(app)
      .post('/api/orders')
      .send({ items: [{ productId: 'p005', quantity: 1 }] });
    expect(oos.status).toBe(409);
    expect(oos.body.error.code).toBe('OUT_OF_STOCK');
  });

  it('validates order bodies', async () => {
    expect((await request(app).post('/api/orders').send({ items: [] })).status).toBe(400);
    expect(
      (
        await request(app)
          .post('/api/orders')
          .send({ items: [{ productId: 'p001', quantity: 0 }] })
      ).status,
    ).toBe(400);
    expect(
      (await request(app).post('/api/orders').set('content-type', 'application/json').send('{bad'))
        .status,
    ).toBe(400);
  });

  it('creates and retrieves an order', async () => {
    const created = await request(app)
      .post('/api/orders')
      .send({ items: [{ productId: 'p003', quantity: 2 }] });
    expect(created.status).toBe(201);
    expect(created.body.status).toBe('PENDING_PAYMENT');
    const fetched = await request(app).get(`/api/orders/${created.body.id}`);
    expect(fetched.body.total).toBe(created.body.total);
    expect((await request(app).get('/api/orders/missing')).status).toBe(404);
  });
});

describe('push', () => {
  let ctx: ReturnType<typeof build>;
  beforeEach(() => {
    ctx = build({ ADMIN_API_KEY: 'secret' });
  });

  const sub = { endpoint: 'https://push.example/abc', keys: { p256dh: 'k', auth: 'a' } };

  it('exposes the public key', async () => {
    expect((await request(ctx.app).get('/api/push/public-key')).body.publicKey).toBe(
      'test-public-key',
    );
  });

  it('stores valid subscriptions and rejects invalid ones', async () => {
    expect((await request(ctx.app).post('/api/push/subscribe').send(sub)).status).toBe(201);
    expect(ctx.push.subscribe).toHaveBeenCalled();
    expect(
      (
        await request(ctx.app)
          .post('/api/push/subscribe')
          .send({ endpoint: 'http://insecure', keys: sub.keys })
      ).status,
    ).toBe(400);
    expect((await request(ctx.app).post('/api/push/subscribe').send({})).status).toBe(400);
  });

  it('unsubscribes', async () => {
    await request(ctx.app).post('/api/push/unsubscribe').send({ endpoint: sub.endpoint });
    expect(ctx.push.unsubscribe).toHaveBeenCalledWith(sub.endpoint);
  });

  it('protects broadcast with an API key', async () => {
    expect((await request(ctx.app).post('/api/push/send').send({})).status).toBe(401);
    expect(
      (await request(ctx.app).post('/api/push/send').set('x-api-key', 'wrong').send({})).status,
    ).toBe(401);
    const ok = await request(ctx.app)
      .post('/api/push/send')
      .set('x-api-key', 'secret')
      .send({ title: 'Sale' });
    expect(ok.body.sent).toBe(2);
  });

  it('disables broadcast when no key is configured', async () => {
    const { app } = build();
    expect((await request(app).post('/api/push/send').send({})).status).toBe(503);
  });
});

describe('platform hardening', () => {
  it('sets security headers and hides the framework', async () => {
    const res = await request(build().app).get('/api/health');
    expect(res.headers['x-powered-by']).toBeUndefined();
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('rate limits excessive traffic', async () => {
    const { app } = build({}, { rateLimitMax: 2 });
    await request(app).get('/api/health');
    await request(app).get('/api/health');
    expect((await request(app).get('/api/health')).status).toBe(429);
  });

  it('only allows configured CORS origins', async () => {
    const { app } = build({ CORS_ORIGINS: 'https://shop.example' });
    const allowed = await request(app).get('/api/health').set('Origin', 'https://shop.example');
    const blocked = await request(app).get('/api/health').set('Origin', 'https://evil.example');
    expect(allowed.headers['access-control-allow-origin']).toBe('https://shop.example');
    expect(blocked.headers['access-control-allow-origin']).toBeUndefined();
  });
});

describe('order idempotency', () => {
  const body = { items: [{ productId: 'p001', quantity: 1 }] };

  it('replays the original order for a repeated key', async () => {
    const { app } = build();
    const first = await request(app)
      .post('/api/orders')
      .set('Idempotency-Key', 'key-12345678')
      .send(body);
    const second = await request(app)
      .post('/api/orders')
      .set('Idempotency-Key', 'key-12345678')
      .send(body);
    expect(first.status).toBe(201);
    expect(second.status).toBe(200);
    expect(second.body.id).toBe(first.body.id);
  });

  it('creates distinct orders without a key', async () => {
    const { app } = build();
    const a = await request(app).post('/api/orders').send(body);
    const b = await request(app).post('/api/orders').send(body);
    expect(a.body.id).not.toBe(b.body.id);
  });

  it('rejects a malformed key', async () => {
    const { app } = build();
    const res = await request(app).post('/api/orders').set('Idempotency-Key', 'x').send(body);
    expect(res.status).toBe(400);
  });

  it('sets a request id header', async () => {
    const { app } = build();
    const res = await request(app).get('/api/health');
    expect(res.headers['x-request-id']).toBeTruthy();
  });
});
