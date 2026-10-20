import { afterEach, describe, expect, it, vi } from 'vitest';
import { getJson, postJson } from './httpClient';
import { getToken, setSession } from './session';

describe('session and bearer token', () => {
  afterEach(() => {
    setSession(null);
    vi.unstubAllGlobals();
  });

  it('stores the session and clears it on sign out', () => {
    setSession({ token: 't', email: 'a@example.com' });
    expect(getToken()).toBe('t');
    setSession(null);
    expect(getToken()).toBeUndefined();
  });

  it('sends the token on GET and POST only when signed in', async () => {
    const fetchMock = vi.fn(
      async (_url: string, _init?: RequestInit) => new Response('{}', { status: 200 }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await getJson('http://x/a');
    expect(fetchMock.mock.calls[0][1]?.headers).toEqual({});

    setSession({ token: 'abc', email: 'a@example.com' });
    await getJson('http://x/a');
    await postJson('http://x/b', {});
    expect(fetchMock.mock.calls[1][1]?.headers).toEqual({ authorization: 'Bearer abc' });
    expect(fetchMock.mock.calls[2][1]?.headers).toMatchObject({ authorization: 'Bearer abc' });
  });

  it('exposes the status of failed requests', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('{}', { status: 401 })),
    );
    await expect(postJson('http://x/b', {})).rejects.toMatchObject({ status: 401 });
  });
});
