import { describe, expect, it } from 'vitest';
import { loadConfig } from '../src/config.js';

describe('loadConfig', () => {
  it('applies defaults', () => {
    const c = loadConfig({});
    expect(c.port).toBe(4000);
    expect(c.corsOrigins).toContain('http://localhost:5173');
    expect(c.databaseSsl).toBe(false);
    expect(c.isProduction).toBe(false);
    expect(c.adminApiKey).toBeUndefined();
    expect(c.databaseUrl).toBeUndefined();
    expect(c.databaseSslInsecure).toBe(false);
  });

  it('parses env overrides', () => {
    const c = loadConfig({
      PORT: '8080',
      CORS_ORIGINS: ' https://a.example , https://b.example ,',
      ADMIN_API_KEY: 'k',
      DATABASE_URL: 'postgres://x',
      DATABASE_SSL: 'true',
      NODE_ENV: 'production',
    });
    expect(c.port).toBe(8080);
    expect(c.corsOrigins).toEqual(['https://a.example', 'https://b.example']);
    expect(c.adminApiKey).toBe('k');
    expect(c.databaseUrl).toBe('postgres://x');
    expect(c.databaseSsl).toBe(true);
    expect(c.isProduction).toBe(true);
  });

  it('treats empty strings as unset', () => {
    const c = loadConfig({ ADMIN_API_KEY: '', DATABASE_URL: '' });
    expect(c.adminApiKey).toBeUndefined();
    expect(c.databaseUrl).toBeUndefined();
  });
});
