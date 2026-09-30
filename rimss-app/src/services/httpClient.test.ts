import { afterEach, describe, expect, it, vi } from 'vitest';
import { getJson } from './httpClient';

const ok = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });

afterEach(() => vi.unstubAllGlobals());

describe('getJson', () => {
  it('retries 5xx responses then succeeds', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response('', { status: 503 }))
      .mockResolvedValueOnce(ok({ a: 1 }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(getJson('/x', { retryDelayMs: 1 })).resolves.toEqual({ a: 1 });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('does not retry 4xx responses', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('', { status: 404 }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(getJson('/x', { retryDelayMs: 1 })).rejects.toThrow('404');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('gives up after the retry budget', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('network'));
    vi.stubGlobal('fetch', fetchMock);
    await expect(getJson('/x', { retries: 2, retryDelayMs: 1 })).rejects.toThrow('network');
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
