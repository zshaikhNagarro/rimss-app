import { afterEach, describe, expect, it, vi } from 'vitest';
import { getJson, postJson } from './httpClient';

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

describe('postJson', () => {
  it('sends a JSON body and returns the parsed response', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ id: 'o1' }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(postJson('/x', { a: 1 })).resolves.toEqual({ id: 'o1' });
    const init = fetchMock.mock.calls[0][1];
    expect(init.method).toBe('POST');
    expect(init.headers['content-type']).toBe('application/json');
    expect(init.body).toBe('{"a":1}');
  });

  it('never retries, even on 5xx or network failures', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('', { status: 503 }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(postJson('/x', {})).rejects.toThrow('503');
    fetchMock.mockRejectedValue(new Error('network'));
    await expect(postJson('/x', {})).rejects.toThrow('network');
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('aborts when the timeout elapses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url: string, init: RequestInit) =>
          new Promise((_resolve, reject) =>
            init.signal!.addEventListener('abort', () => reject(new Error('aborted'))),
          ),
      ),
    );
    await expect(postJson('/x', {}, 5)).rejects.toThrow('aborted');
  });
});
