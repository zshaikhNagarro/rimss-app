import cors from 'cors';
import express from 'express';
import type { Express } from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import type { Config } from './config.js';
import { errorHandler, notFound } from './errors.js';
import { createLogger, requestLogger } from './logger.js';
import type { Logger } from './logger.js';
import type { OrderStore } from './orders.js';
import type { ProductRepository } from './products.js';
import type { PushService } from './push.js';
import { catalogRoutes } from './routes/catalog.js';
import { healthRoutes } from './routes/health.js';
import { orderRoutes } from './routes/orders.js';
import { pushRoutes } from './routes/push.js';
import { telemetryRoutes } from './routes/telemetry.js';

export interface AppDeps {
  config: Config;
  products: ProductRepository;
  orders: OrderStore;
  push: PushService;
  logger?: Logger;
  /** Optional dependency probe (e.g. database ping) used by /api/ready. */
  ping?: () => Promise<void>;
  /** JSON file receiving frontend telemetry; the endpoint is disabled when unset. */
  telemetryFile?: string;
}

// Composition root: wires middleware and feature routers; all dependencies are injected.
export function createApp(
  { config, products, orders, push, ping, logger, telemetryFile }: AppDeps,
  opts: { rateLimitMax?: number } = {},
): Express {
  const app = express();
  app.disable('x-powered-by');
  app.use(requestLogger(logger ?? createLogger(config.logLevel)));
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
  if (telemetryFile) app.use('/api', telemetryRoutes(telemetryFile));

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
