import { afterEach, describe, expect, it, vi } from 'vitest';
import { getJson, postJson } from './httpClient';
import { getSession, setSession } from './session';

describe('session and cookie auth', () => {
  afterEach(() => {
    setSession(null);
    vi.unstubAllGlobals();
  });

  it('stores the session and clears it on sign out', () => {
    setSession({ email: 'a@example.com' });
    expect(getSession()).toEqual({ email: 'a@example.com' });
    setSession(null);
    expect(getSession()).toBeNull();
  });

  it('never persists a token and sends credentials instead of an auth header', async () => {
    const fetchMock = vi.fn(
      async (_url: string, _init?: RequestInit) => new Response('{}', { status: 200 }),
    );
    vi.stubGlobal('fetch', fetchMock);

    setSession({ email: 'a@example.com' });
    expect(sessionStorage.getItem('rimss.auth.v1')).not.toMatch(/token/);
    await getJson('http://x/a');
    await postJson('http://x/b', {});
    for (const call of fetchMock.mock.calls) {
      expect(call[1]?.credentials).toBe('include');
      expect(JSON.stringify(call[1]?.headers ?? {})).not.toMatch(/authorization/i);
    }
  });

  it('signs out when the server answers 401', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('{}', { status: 401 })),
    );
    setSession({ email: 'a@example.com' });
    await expect(getJson('http://x/a')).rejects.toMatchObject({ status: 401 });
    expect(getSession()).toBeNull();
  });

  it('exposes the status and API error code of failed requests', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify({ error: { code: 'OUT_OF_STOCK' } }), { status: 409 }),
      ),
    );
    await expect(postJson('http://x/b', {})).rejects.toMatchObject({
      status: 409,
      code: 'OUT_OF_STOCK',
    });
  });
});
