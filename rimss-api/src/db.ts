import fs from 'node:fs';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import type { Order, Product, ProductFilters } from '@rimss/shared';
import type { Pool } from 'pg';
import type { User, UserStore } from './auth.js';
import { newOrder } from './orders.js';
import { HttpError } from './errors.js';
import type { OrderStore } from './orders.js';
import { readSeedProducts, stockError } from './products.js';
import type { ProductRepository, StockLine } from './products.js';
import type { SubscriptionStore } from './push.js';

export async function migrate(pool: Pool, migrationsDir: string): Promise<void> {
  const applied = new Set<string>();
  try {
    (await pool.query('SELECT name FROM schema_migrations')).rows.forEach((r) =>
      applied.add(r.name),
    );
  } catch {
    await pool.query('CREATE TABLE schema_migrations (name TEXT PRIMARY KEY)');
  }
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();
  for (const file of files) {
    if (applied.has(file)) continue;
    await pool.query(fs.readFileSync(path.join(migrationsDir, file), 'utf8'));
    await pool.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
  }
}

// Seeds the catalog only when the table is empty, so restarts never overwrite edits.
export async function seedProducts(pool: Pool, dataDir: string): Promise<number> {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM products');
  if (rows[0].n > 0) return 0;
  const products = readSeedProducts(dataDir);
  for (const p of products) {
    await pool.query(
      `INSERT INTO products (id, name, category, color, price, discount_percent, image, description, sizes, in_stock, stock)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) ON CONFLICT (id) DO NOTHING`,
      [
        p.id,
        p.name,
        p.category,
        p.color,
        p.price,
        p.discountPercent,
        p.image,
        p.description,
        JSON.stringify(p.sizes),
        p.inStock,
        p.stock,
      ],
    );
  }
  return products.length;
}

const num = (v: unknown) => Number(v);

interface ProductRow {
  id: string;
  name: string;
  category: string;
  color: string;
  price: string;
  discount_percent: number;
  image: string;
  description: string;
  sizes: string[];
  in_stock: boolean;
  stock: number;
}

const toProduct = (r: ProductRow): Product => ({
  id: r.id,
  name: r.name,
  category: r.category,
  color: r.color,
  price: num(r.price),
  discountPercent: r.discount_percent,
  image: r.image,
  description: r.description,
  sizes: r.sizes,
  inStock: r.in_stock,
  stock: r.stock,
});

const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

export function createPgProductRepository(pool: Pool): ProductRepository {
  return {
    async search(f: ProductFilters) {
      const where: string[] = [];
      const params: unknown[] = [];
      const add = (sql: string, value: unknown) => {
        params.push(value);
        where.push(sql.replace('?', `$${params.length}`));
      };
      const q = f.q?.trim();
      if (q) add('LOWER(name) LIKE ?', `%${escapeLike(q.toLowerCase())}%`);
      if (f.category) add('LOWER(category) = ?', f.category.toLowerCase());
      if (f.color) add('LOWER(color) = ?', f.color.toLowerCase());
      if (f.maxPrice !== undefined) add('price <= ?', f.maxPrice);
      if (f.discountedOnly) where.push('discount_percent > 0');

      const sql = `SELECT * FROM products ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY id`;
      const { rows } = await pool.query(sql, params);
      return rows.map(toProduct);
    },
    async byId(id) {
      const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
      return rows[0] ? toProduct(rows[0]) : undefined;
    },
    async byIds(ids) {
      if (ids.length === 0) return [];
      const marks = ids.map((_, i) => `$${i + 1}`).join(', ');
      const { rows } = await pool.query(`SELECT * FROM products WHERE id IN (${marks})`, ids);
      return rows.map(toProduct);
    },
    async categories() {
      const { rows } = await pool.query('SELECT DISTINCT category FROM products ORDER BY category');
      return rows.map((r) => r.category);
    },
    async colors() {
      const { rows } = await pool.query('SELECT DISTINCT color FROM products ORDER BY color');
      return rows.map((r) => r.color);
    },
    async reserve(lines) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await reserveInTx(client, lines);
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    },
    async release(lines) {
      await releaseInTx(pool, lines);
    },
  };
}

type Queryable = Pick<Pool, 'query'>;

// Sorted by id so concurrent orders lock rows in the same order and cannot deadlock.
const sortLines = (lines: StockLine[]) =>
  [...lines].sort((a, b) => a.productId.localeCompare(b.productId));

// The conditional UPDATE is atomic, so concurrent orders cannot oversell.
async function reserveInTx(db: Queryable, lines: StockLine[]): Promise<void> {
  for (const { productId, quantity } of sortLines(lines)) {
    const res = await db.query(
      `UPDATE products SET stock = stock - $1::int, in_stock = (stock - $1::int) > 0
       WHERE id = $2 AND in_stock AND stock >= $1::int`,
      [quantity, productId],
    );
    if (res.rowCount === 0) {
      const { rows } = await db.query('SELECT name, stock FROM products WHERE id = $1', [
        productId,
      ]);
      throw rows[0]
        ? stockError(rows[0].name, rows[0].stock)
        : new HttpError(422, 'UNKNOWN_PRODUCT', `Unknown product: ${productId}`);
    }
  }
}

async function releaseInTx(db: Queryable, lines: StockLine[]): Promise<void> {
  for (const { productId, quantity } of sortLines(lines)) {
    await db.query(
      'UPDATE products SET stock = stock + $1, in_stock = (stock + $1) > 0 WHERE id = $2',
      [quantity, productId],
    );
  }
}

export function createPgOrderStore(pool: Pool): OrderStore {
  const store: OrderStore = {
    async create(quote, idempotencyKey, userId) {
      const order = newOrder(quote, userId);
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await reserveInTx(client, order.lines);
        await client.query(
          'INSERT INTO orders (id, status, subtotal, discount_total, total, created_at, idempotency_key, user_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
          [
            order.id,
            order.status,
            order.subtotal,
            order.discountTotal,
            order.total,
            order.createdAt,
            idempotencyKey ?? null,
            userId ?? null,
          ],
        );
        for (const l of order.lines) {
          await client.query(
            `INSERT INTO order_lines (order_id, product_id, name, quantity, discount_percent, unit_price, line_total)
             VALUES ($1,$2,$3,$4,$5,$6,$7)`,
            [
              order.id,
              l.productId,
              l.name,
              l.quantity,
              l.discountPercent,
              l.unitPrice,
              l.lineTotal,
            ],
          );
        }
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        // Concurrent retry with the same key lost the unique-index race.
        if (idempotencyKey && (err as { code?: string }).code === '23505') {
          const existing = await store.findByIdempotencyKey(idempotencyKey);
          if (existing) return existing;
        }
        throw err;
      } finally {
        client.release();
      }
      return order;
    },
    async findByIdempotencyKey(key) {
      const { rows } = await pool.query('SELECT id FROM orders WHERE idempotency_key = $1', [key]);
      return rows[0] ? store.get(rows[0].id) : undefined;
    },
    async get(id) {
      const { rows } = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
      if (!rows[0]) return undefined;
      const lines = await pool.query(
        'SELECT * FROM order_lines WHERE order_id = $1 ORDER BY product_id',
        [id],
      );
      const o = rows[0];
      const order: Order = {
        id: o.id,
        status: o.status,
        subtotal: num(o.subtotal),
        discountTotal: num(o.discount_total),
        total: num(o.total),
        createdAt: new Date(o.created_at).toISOString(),
        ...(o.user_id && { userId: o.user_id }),
        lines: lines.rows.map((l) => ({
          productId: l.product_id,
          name: l.name,
          quantity: l.quantity,
          discountPercent: l.discount_percent,
          unitPrice: num(l.unit_price),
          lineTotal: num(l.line_total),
        })),
      };
      return order;
    },
    async setStatus(id, status) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const prev = await client.query('SELECT status FROM orders WHERE id = $1 FOR UPDATE', [id]);
        if (prev.rows[0] && status === 'CANCELLED' && prev.rows[0].status !== 'CANCELLED') {
          const { rows } = await client.query(
            'SELECT product_id, quantity FROM order_lines WHERE order_id = $1',
            [id],
          );
          await releaseInTx(
            client,
            rows.map((r) => ({ productId: r.product_id, quantity: r.quantity })),
          );
        }
        await client.query('UPDATE orders SET status = $1 WHERE id = $2', [status, id]);
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
      return store.get(id);
    },
    async listByUser(userId) {
      const { rows } = await pool.query(
        'SELECT id FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
        [userId],
      );
      const orders = await Promise.all(rows.map((r) => store.get(r.id)));
      return orders.filter((o): o is Order => o !== undefined);
    },
  };
  return store;
}

export function createPgUserStore(pool: Pool): UserStore {
  const toUser = (r: { id: string; email: string; password_hash: string }): User => ({
    id: r.id,
    email: r.email,
    passwordHash: r.password_hash,
  });
  return {
    async create(email, passwordHash) {
      const id = randomUUID();
      try {
        const { rows } = await pool.query(
          'INSERT INTO users (id, email, password_hash) VALUES ($1,$2,$3) RETURNING *',
          [id, email, passwordHash],
        );
        return toUser(rows[0]);
      } catch (err) {
        if ((err as { code?: string }).code === '23505') return undefined;
        throw err;
      }
    },
    async findByEmail(email) {
      const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      return rows[0] ? toUser(rows[0]) : undefined;
    },
  };
}

export function createPgSubscriptionStore(pool: Pool): SubscriptionStore {
  return {
    async add(s) {
      await pool.query(
        `INSERT INTO push_subscriptions (endpoint, p256dh, auth, expiration_time) VALUES ($1,$2,$3,$4)
         ON CONFLICT (endpoint) DO UPDATE SET p256dh = EXCLUDED.p256dh, auth = EXCLUDED.auth, expiration_time = EXCLUDED.expiration_time`,
        [s.endpoint, s.keys.p256dh, s.keys.auth, s.expirationTime ?? null],
      );
    },
    async remove(endpoint) {
      await pool.query('DELETE FROM push_subscriptions WHERE endpoint = $1', [endpoint]);
    },
    async all() {
      const { rows } = await pool.query('SELECT * FROM push_subscriptions');
      return rows.map((r) => ({
        endpoint: r.endpoint,
        expirationTime: r.expiration_time === null ? null : Number(r.expiration_time),
        keys: { p256dh: r.p256dh, auth: r.auth },
      }));
    },
  };
}
