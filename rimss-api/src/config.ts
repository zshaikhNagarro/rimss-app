import path from 'node:path';

export interface Config {
  port: number;
  corsOrigins: string[];
  dataDir: string;
  adminApiKey?: string;
  databaseUrl?: string;
  databaseSsl: boolean;
  /** PEM of the CA that signed the database certificate. */
  databaseSslCa?: string;
  /** Explicit opt-out of certificate verification; leave false in production. */
  databaseSslInsecure: boolean;
  logLevel: string;
  migrationsDir: string;
  vapidPublicKey?: string;
  vapidPrivateKey?: string;
  vapidSubject: string;
  isProduction: boolean;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  return {
    port: Number(env.PORT ?? 4000),
    // Comma-separated allow-list; defaults to the local Vite dev servers.
    corsOrigins: (
      env.CORS_ORIGINS ?? 'http://localhost:5173,http://localhost:5174,http://localhost:5199'
    )
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    dataDir: env.DATA_DIR ?? path.resolve(import.meta.dirname, '..', 'data'),
    adminApiKey: env.ADMIN_API_KEY || undefined,
    databaseUrl: env.DATABASE_URL || undefined,
    databaseSsl: env.DATABASE_SSL === 'true',
    databaseSslCa: env.DATABASE_SSL_CA?.replace(/\\n/g, '\n') || undefined,
    databaseSslInsecure: env.DATABASE_SSL_INSECURE === 'true',
    logLevel: env.LOG_LEVEL ?? (env.NODE_ENV === 'test' ? 'silent' : 'info'),
    migrationsDir: path.resolve(import.meta.dirname, '..', 'migrations'),
    vapidPublicKey: env.VAPID_PUBLIC_KEY || undefined,
    vapidPrivateKey: env.VAPID_PRIVATE_KEY || undefined,
    vapidSubject: env.VAPID_SUBJECT ?? 'mailto:admin@example.com',
    isProduction: env.NODE_ENV === 'production',
  };
}
