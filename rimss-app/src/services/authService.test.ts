import { afterEach, describe, expect, it, vi } from 'vitest';
import { authService } from './authService';
import { getSession, setSession } from './session';

afterEach(() => {
  setSession(null);
  vi.unstubAllGlobals();
});

const stubAuth = (status = 200) => {
  const fetchMock = vi.fn(
    async (_url: string, _init?: RequestInit) =>
      new Response(JSON.stringify({ token: 'tok', user: { email: 'a@example.com' } }), { status }),
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
};

describe('authService', () => {
  it('logs in, posts credentials and stores the session', async () => {
    const fetchMock = stubAuth();
    await authService.login('a@example.com', 'password1');
    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/auth\/login$/);
    expect(JSON.parse(String(fetchMock.mock.calls[0][1]?.body))).toEqual({
      email: 'a@example.com',
      password: 'password1',
    });
    expect(getSession()).toEqual({ token: 'tok', email: 'a@example.com' });
  });

  it('registers through the register endpoint', async () => {
    const fetchMock = stubAuth();
    await authService.register('a@example.com', 'password1');
    expect(String(fetchMock.mock.calls[0][0])).toMatch(/\/auth\/register$/);
  });

  it('keeps the session empty when the request fails', async () => {
    stubAuth(401);
    await expect(authService.login('a@example.com', 'bad')).rejects.toThrow();
    expect(getSession()).toBeNull();
  });

  it('logs out', async () => {
    stubAuth();
    await authService.login('a@example.com', 'password1');
    authService.logout();
    expect(getSession()).toBeNull();
  });
});
