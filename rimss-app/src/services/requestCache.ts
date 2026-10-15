/** In-memory TTL cache that also de-duplicates concurrent identical requests. Failures are never cached. */
export function createRequestCache(ttlMs: number, now: () => number = Date.now) {
  const entries = new Map<string, { expires: number; promise: Promise<unknown> }>();

  return {
    get<T>(key: string, load: () => Promise<T>): Promise<T> {
      const hit = entries.get(key);
      if (hit && hit.expires > now()) return hit.promise as Promise<T>;
      const promise = load();
      entries.set(key, { expires: now() + ttlMs, promise });
      promise.catch(() => {
        if (entries.get(key)?.promise === promise) entries.delete(key);
      });
      return promise;
    },
    clear: () => entries.clear(),
  };
}
