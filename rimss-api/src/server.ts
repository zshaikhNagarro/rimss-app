import path from 'node:path';
import pg from 'pg';
import { createApp } from './app.js';
import { loadConfig } from './config.js';
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
  const keys = resolveVapidKeys(
    { publicKey: config.vapidPublicKey, privateKey: config.vapidPrivateKey },
    config.databaseUrl ? undefined : path.join(config.dataDir, 'vapid.json'),
  );

  let deps: AppDeps;
  let closeDb = async () => {};

  if (config.databaseUrl) {
    const pool = new pg.Pool({
      connectionString: config.databaseUrl,
      ssl: config.databaseSsl ? { rejectUnauthorized: false } : undefined,
      max: 10,
    });
    await migrate(pool, config.migrationsDir);
    const seeded = await seedProducts(pool, config.dataDir);
    console.log(`Postgres ready (${seeded} products seeded)`);
    closeDb = () => pool.end();
    deps = {
      config,
      products: createPgProductRepository(pool),
      orders: createPgOrderStore(pool),
      push: createPushService(keys, createPgSubscriptionStore(pool), config.vapidSubject),
      ping: async () => void (await pool.query('SELECT 1')),
    };
  } else {
    console.warn('DATABASE_URL not set: using in-memory orders and JSON files (dev only)');
    deps = {
      config,
      products: createFileProductRepository(config.dataDir),
      orders: createMemoryOrderStore(),
      push: createPushService(
        keys,
        createFileSubscriptionStore(path.join(config.dataDir, 'subscriptions.json')),
        config.vapidSubject,
      ),
    };
  }

  const server = createApp(deps).listen(config.port, () => {
    console.log(`RIMSS API listening on http://localhost:${config.port}`);
  });

  for (const signal of ['SIGINT', 'SIGTERM'] as const) {
    process.on(signal, () => server.close(() => closeDb().finally(() => process.exit(0))));
  }
}

main().catch((err) => {
  console.error('Failed to start', err);
  process.exit(1);
});
