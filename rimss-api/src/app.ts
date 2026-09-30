import { timingSafeEqual } from 'node:crypto';
import cors from 'cors';
import express from 'express';
import type { Express, NextFunction, Request, Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import { z } from 'zod';
import type { Config } from './config.js';
import { errorHandler, HttpError, notFound } from './errors.js';
import { buildQuote } from './orders.js';
import type { OrderStore } from './orders.js';
import type { ProductRepository } from './products.js';
import type { PushService } from './push.js';

export interface AppDeps {
  config: Config;
  products: ProductRepository;
  orders: OrderStore;
  push: PushService;
  /** Optional dependency probe (e.g. database ping) used by /api/ready. */
  ping?: () => Promise<void>;
}

const filtersSchema = z.object({
  q: z.string().max(100).optional(),
  category: z.string().max(50).optional(),
  color: z.string().max(50).optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  discountedOnly: z.enum(['true', 'false']).optional(),
});

const orderSchema = z.object({
  items: z
    .array(
      z.object({ productId: z.string().min(1).max(50), quantity: z.number().int().min(1).max(99) }),
    )
    .min(1)
    .max(50),
});

const subscriptionSchema = z.object({
  endpoint: z.url().refine((u) => u.startsWith('https://'), 'endpoint must be https'),
  expirationTime: z.number().nullable().optional(),
  keys: z.object({ p256dh: z.string().min(1), auth: z.string().min(1) }),
});

const broadcastSchema = z.object({
  title: z.string().min(1).max(100).default('RIMSS'),
  body: z.string().max(300).default(''),
  url: z.string().startsWith('/').max(200).default('/'),
});

function requireAdmin(adminKey?: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!adminKey)
      return next(new HttpError(503, 'ADMIN_DISABLED', 'ADMIN_API_KEY is not configured'));
    const given = Buffer.from(String(req.header('x-api-key') ?? ''));
    const expected = Buffer.from(adminKey);
    if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
      return next(new HttpError(401, 'UNAUTHORIZED', 'Invalid API key'));
    }
    next();
  };
}

export function createApp(
  { config, products, orders, push, ping }: AppDeps,
  opts: { rateLimitMax?: number } = {},
): Express {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: config.corsOrigins }));
  app.use(express.json({ limit: '20kb' }));
  app.use(
    rateLimit({
      windowMs: 60_000,
      limit: opts.rateLimitMax ?? 300,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
    }),
  );

  app.get('/api/health', (_req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

  app.get('/api/ready', async (_req, res) => {
    try {
      await ping?.();
      res.json({ status: 'ready' });
    } catch {
      res.status(503).json({ error: { code: 'NOT_READY', message: 'Dependency unavailable' } });
    }
  });

  app.get('/api/products', async (req, res) => {
    const f = filtersSchema.parse(req.query);
    res.json(await products.search({ ...f, discountedOnly: f.discountedOnly === 'true' }));
  });

  app.get('/api/products/:id', async (req, res) => {
    const product = await products.byId(req.params.id);
    if (!product) throw new HttpError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
    res.json(product);
  });

  app.get('/api/categories', async (_req, res) => res.json(await products.categories()));
  app.get('/api/colors', async (_req, res) => res.json(await products.colors()));

  // Server-side pricing: the client sends ids and quantities only.
  app.post('/api/cart/quote', async (req, res) => {
    const { items } = orderSchema.parse(req.body);
    res.json(await buildQuote(products, items));
  });

  app.post('/api/orders', async (req, res) => {
    const { items } = orderSchema.parse(req.body);
    res.status(201).json(await orders.create(await buildQuote(products, items)));
  });

  app.get('/api/orders/:id', async (req, res) => {
    const order = await orders.get(req.params.id);
    if (!order) throw new HttpError(404, 'ORDER_NOT_FOUND', 'Order not found');
    res.json(order);
  });

  app.get('/api/push/public-key', (_req, res) => res.json({ publicKey: push.publicKey }));

  app.post('/api/push/subscribe', async (req, res) => {
    const sub = subscriptionSchema.parse(req.body);
    await push.subscribe({
      endpoint: sub.endpoint,
      expirationTime: sub.expirationTime ?? null,
      keys: sub.keys,
    });
    res.status(201).json({ ok: true });
  });

  app.post('/api/push/unsubscribe', async (req, res) => {
    const { endpoint } = z.object({ endpoint: z.string().min(1) }).parse(req.body);
    await push.unsubscribe(endpoint);
    res.json({ ok: true });
  });

  app.post('/api/push/send', requireAdmin(config.adminApiKey), async (req, res) => {
    const payload = broadcastSchema.parse(req.body ?? {});
    res.json({ sent: await push.broadcast(payload) });
  });

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
