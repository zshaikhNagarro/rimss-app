import fs from 'node:fs';
import path from 'node:path';
import webpush from 'web-push';
import type { PushSubscription } from 'web-push';

export interface SubscriptionStore {
  add(sub: PushSubscription): Promise<void>;
  remove(endpoint: string): Promise<void>;
  all(): Promise<PushSubscription[]>;
}

export interface PushService {
  publicKey: string;
  subscribe(sub: PushSubscription): Promise<void>;
  unsubscribe(endpoint: string): Promise<void>;
  broadcast(payload: { title: string; body: string; url: string }): Promise<number>;
}

export function createMemorySubscriptionStore(): SubscriptionStore {
  const subs = new Map<string, PushSubscription>();
  return {
    add: async (s) => void subs.set(s.endpoint, s),
    remove: async (e) => void subs.delete(e),
    all: async () => [...subs.values()],
  };
}

// JSON-file store for running without a database.
export function createFileSubscriptionStore(file: string): SubscriptionStore {
  const read = (): PushSubscription[] =>
    fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : [];
  const write = (subs: PushSubscription[]) => fs.writeFileSync(file, JSON.stringify(subs));
  return {
    async add(s) {
      write([...read().filter((x) => x.endpoint !== s.endpoint), s]);
    },
    async remove(endpoint) {
      write(read().filter((x) => x.endpoint !== endpoint));
    },
    all: async () => read(),
  };
}

export interface VapidKeys {
  publicKey: string;
  privateKey: string;
}

// Order: explicit env keys, then a persisted file, otherwise generate (and persist if a file is given).
export function resolveVapidKeys(
  env: { publicKey?: string; privateKey?: string },
  keyFile?: string,
): VapidKeys {
  if (env.publicKey && env.privateKey)
    return { publicKey: env.publicKey, privateKey: env.privateKey };
  if (keyFile && fs.existsSync(keyFile)) return JSON.parse(fs.readFileSync(keyFile, 'utf8'));
  const keys = webpush.generateVAPIDKeys();
  if (keyFile) {
    fs.mkdirSync(path.dirname(keyFile), { recursive: true });
    fs.writeFileSync(keyFile, JSON.stringify(keys));
  }
  return keys;
}

export function createPushService(
  keys: VapidKeys,
  store: SubscriptionStore,
  subject: string,
): PushService {
  webpush.setVapidDetails(subject, keys.publicKey, keys.privateKey);
  return {
    publicKey: keys.publicKey,
    subscribe: (sub) => store.add(sub),
    unsubscribe: (endpoint) => store.remove(endpoint),
    async broadcast(payload) {
      const body = JSON.stringify(payload);
      let sent = 0;
      await Promise.all(
        (await store.all()).map(async (sub) => {
          try {
            await webpush.sendNotification(sub, body);
            sent++;
          } catch (err) {
            const status = (err as { statusCode?: number }).statusCode;
            if (status === 404 || status === 410) await store.remove(sub.endpoint);
          }
        }),
      );
      return sent;
    },
  };
}
