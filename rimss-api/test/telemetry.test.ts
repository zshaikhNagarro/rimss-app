import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';
import { createMemoryOrderStore } from '../src/orders.js';
import { createFileProductRepository } from '../src/products.js';

const dataDir = path.resolve(import.meta.dirname, '..', 'data');

let dir: string;
let file: string;
beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rimss-telemetry-'));
  file = path.join(dir, 'telemetry.json');
});
afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

const build = (telemetryFile?: string) =>
  createApp({
    config: loadConfig({ DATA_DIR: dataDir, LOG_LEVEL: 'silent' }),
    products: createFileProductRepository(dataDir),
    orders: createMemoryOrderStore(),
    push: {
      publicKey: 'k',
      subscribe: vi.fn(),
      unsubscribe: vi.fn(),
      broadcast: vi.fn(),
    },
    telemetryFile,
  });

describe('POST /api/telemetry', () => {
  it('stores JSON and beacon (text/plain) events', async () => {
    const app = build(file);
    const event = { type: 'analytics', message: 'page_view', context: { path: '/' } };
    expect((await request(app).post('/api/telemetry').send(event)).status).toBe(204);
    expect(
      (
        await request(app)
          .post('/api/telemetry')
          .set('Content-Type', 'text/plain')
          .send(JSON.stringify({ ...event, message: 'add_to_cart' }))
      ).status,
    ).toBe(204);
    const saved = JSON.parse(fs.readFileSync(file, 'utf8'));
    expect(saved.map((e: { message: string }) => e.message)).toEqual(['page_view', 'add_to_cart']);
    expect(saved[0].receivedAt).toBeTruthy();
  });

  it('rejects invalid events', async () => {
    const res = await request(build(file)).post('/api/telemetry').send({ type: 'bogus' });
    expect(res.status).toBe(400);
  });

  it('is not mounted without a telemetry file', async () => {
    const res = await request(build()).post('/api/telemetry').send({});
    expect(res.status).toBe(404);
  });
});
