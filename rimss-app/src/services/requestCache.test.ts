import { describe, expect, it, vi } from 'vitest';
import { createRequestCache } from './requestCache';

describe('requestCache', () => {
  it('shares one in-flight request and serves later calls from cache', async () => {
    const cache = createRequestCache(1000);
    const load = vi.fn().mockResolvedValue('v');
    const [a, b] = await Promise.all([cache.get('k', load), cache.get('k', load)]);
    expect([a, b]).toEqual(['v', 'v']);
    await cache.get('k', load);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('reloads after the TTL expires', async () => {
    let t = 0;
    const cache = createRequestCache(1000, () => t);
    const load = vi.fn().mockResolvedValue('v');
    await cache.get('k', load);
    t = 1001;
    await cache.get('k', load);
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('does not cache failures', async () => {
    const cache = createRequestCache(1000);
    const load = vi.fn().mockRejectedValueOnce(new Error('x')).mockResolvedValue('ok');
    await expect(cache.get('k', load)).rejects.toThrow('x');
    await expect(cache.get('k', load)).resolves.toBe('ok');
  });

  it('keys entries independently and can be cleared', async () => {
    const cache = createRequestCache(1000);
    const load = vi.fn().mockResolvedValue(1);
    await cache.get('a', load);
    await cache.get('b', load);
    cache.clear();
    await cache.get('a', load);
    expect(load).toHaveBeenCalledTimes(3);
  });
});
