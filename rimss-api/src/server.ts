import path from 'node:path';
import pg from 'pg';
import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { createLogger } from './logger.js';
import {
  createPgOrderStore,
  createPgProductRepository,
  createPgSubscriptionStore,
  migrate,
  seedProducts,
} from './db.js';
import { createMemoryOrderStore } from './orders.js';
import { createFileProductRepository } from './products.js';
import { createFileSubscriptionStore, createPushService, resolveVapidKeys } from './push.js';
import type { AppDeps } from './app.js';

async function main() {
  const config = loadConfig();
  const logger = createLogger(config.logLevel);
  const keys = resolveVapidKeys(
    { publicKey: config.vapidPublicKey, privateKey: config.vapidPrivateKey },
    config.databaseUrl ? undefined : path.join(config.dataDir, 'vapid.json'),
  );

  let deps: AppDeps;
  let closeDb = async () => {};

  if (config.databaseUrl) {
    const pool = new pg.Pool({
      connectionString: config.databaseUrl,
      ssl: config.databaseSsl
        ? { ca: config.databaseSslCa, rejectUnauthorized: !config.databaseSslInsecure }
        : undefined,
      max: 10,
    });
    await migrate(pool, config.migrationsDir);
    const seeded = await seedProducts(pool, config.dataDir);
    logger.info({ seeded }, 'postgres ready');
    closeDb = () => pool.end();
    deps = {
      config,
      logger,
      products: createPgProductRepository(pool),
      orders: createPgOrderStore(pool),
      push: createPushService(keys, createPgSubscriptionStore(pool), config.vapidSubject),
      ping: async () => void (await pool.query('SELECT 1')),
    };
  } else {
    logger.warn('DATABASE_URL not set: using in-memory orders and JSON files (dev only)');
    deps = {
      config,
      logger,
      products: createFileProductRepository(config.dataDir),
      orders: createMemoryOrderStore(),
      push: createPushService(
        keys,
        createFileSubscriptionStore(path.join(config.dataDir, 'subscriptions.json')),
        config.vapidSubject,
      ),
    };
  }

  const server = createApp({
    ...deps,
    telemetryFile: path.join(config.dataDir, 'telemetry.json'),
  }).listen(config.port, () => {
    logger.info({ port: config.port }, 'RIMSS API listening');
  });

  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.on(signal, () => server.close(() => closeDb().finally(() => process.exit(0))));
  }
}

main().catch((err) => {
  createLogger('error').fatal({ err }, 'failed to start');
  process.exit(1);
});
