import cors from 'cors';
import express from 'express';
import type { Express } from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import type { Config } from './config.js';
import { errorHandler, notFound } from './errors.js';
import type { OrderStore } from './orders.js';
import type { ProductRepository } from './products.js';
import type { PushService } from './push.js';
import { catalogRoutes } from './routes/catalog.js';
import { healthRoutes } from './routes/health.js';
import { orderRoutes } from './routes/orders.js';
import { pushRoutes } from './routes/push.js';

export interface AppDeps {
  config: Config;
  products: ProductRepository;
  orders: OrderStore;
  push: PushService;
  /** Optional dependency probe (e.g. database ping) used by /api/ready. */
  ping?: () => Promise<void>;
}

// Composition root: wires middleware and feature routers; all dependencies are injected.
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

  app.use('/api', healthRoutes(ping));
  app.use('/api', catalogRoutes(products));
  app.use('/api', orderRoutes(products, orders));
  app.use('/api', pushRoutes(push, config.adminApiKey));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
