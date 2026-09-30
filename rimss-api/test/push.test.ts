import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import webpush from 'web-push';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createFileSubscriptionStore,
  createPushService,
  resolveVapidKeys,
  type SubscriptionStore,
} from '../src/push.js';

const sub = (n: number) => ({
  endpoint: `https://push.example/${n}`,
  keys: { p256dh: 'k', auth: 'a' },
});

let dir: string;
beforeEach(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rimss-push-'));
});
afterEach(() => {
  fs.rmSync(dir, { recursive: true, force: true });
  vi.restoreAllMocks();
});

describe('file subscription store', () => {
  it('is empty when the file does not exist', async () => {
    expect(await createFileSubscriptionStore(path.join(dir, 's.json')).all()).toEqual([]);
  });

  it('adds without duplicating and removes by endpoint', async () => {
    const store = createFileSubscriptionStore(path.join(dir, 's.json'));
    await store.add(sub(1));
    await store.add(sub(1));
    await store.add(sub(2));
    expect(await store.all()).toHaveLength(2);
    await store.remove(sub(1).endpoint);
    expect((await store.all()).map((s) => s.endpoint)).toEqual([sub(2).endpoint]);
  });
});

describe('resolveVapidKeys', () => {
  it('prefers explicit env keys', () => {
    expect(resolveVapidKeys({ publicKey: 'pub', privateKey: 'priv' })).toEqual({
      publicKey: 'pub',
      privateKey: 'priv',
    });
  });

  it('generates keys, persists them and reuses the file', () => {
    const file = path.join(dir, 'nested', 'vapid.json');
    const first = resolveVapidKeys({}, file);
    expect(fs.existsSync(file)).toBe(true);
    expect(resolveVapidKeys({}, file)).toEqual(first);
  });

  it('generates without persisting when no file is given', () => {
    const keys = resolveVapidKeys({});
    expect(keys.publicKey).toBeTruthy();
    expect(keys.privateKey).toBeTruthy();
  });
});

describe('push service', () => {
  const keys = webpush.generateVAPIDKeys();

  function memoryStore(initial: ReturnType<typeof sub>[]): SubscriptionStore {
    let subs = [...initial];
    return {
      add: async (s) => void subs.push(s),
      remove: async (e) => void (subs = subs.filter((s) => s.endpoint !== e)),
      all: async () => subs,
    };
  }

  it('broadcasts, counts successes and prunes expired subscriptions', async () => {
    const store = memoryStore([sub(1), sub(2), sub(3)]);
    vi.spyOn(webpush, 'sendNotification').mockImplementation(async (s) => {
      const endpoint = (s as { endpoint: string }).endpoint;
      if (endpoint.endsWith('/2')) throw Object.assign(new Error('gone'), { statusCode: 410 });
      if (endpoint.endsWith('/3')) throw Object.assign(new Error('boom'), { statusCode: 500 });
      return {} as webpush.SendResult;
    });
    const svc = createPushService(keys, store, 'mailto:test@example.com');

    expect(svc.publicKey).toBe(keys.publicKey);
    const sent = await svc.broadcast({ title: 't', body: 'b', url: '/' });

    expect(sent).toBe(1);
    // 410 is pruned; a transient 500 is kept.
    expect((await store.all()).map((s) => s.endpoint)).toEqual([sub(1).endpoint, sub(3).endpoint]);
  });

  it('delegates subscribe and unsubscribe to the store', async () => {
    const store = memoryStore([]);
    const svc = createPushService(keys, store, 'mailto:test@example.com');
    await svc.subscribe(sub(1));
    expect(await store.all()).toHaveLength(1);
    await svc.unsubscribe(sub(1).endpoint);
    expect(await store.all()).toHaveLength(0);
  });
});
