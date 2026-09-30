import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getExistingSubscription,
  isPushSupported,
  subscribeToPush,
  unsubscribeFromPush,
} from './pushService';

const subscription = {
  endpoint: 'https://push.example/1',
  unsubscribe: vi.fn().mockResolvedValue(true),
  toJSON: () => ({ endpoint: 'https://push.example/1', keys: {} }),
};
const pushManager = {
  getSubscription: vi.fn(),
  subscribe: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  pushManager.getSubscription.mockResolvedValue(null);
  pushManager.subscribe.mockResolvedValue(subscription);
  Object.defineProperty(navigator, 'serviceWorker', {
    configurable: true,
    value: { ready: Promise.resolve({ pushManager }) },
  });
  vi.stubGlobal('PushManager', class {});
  vi.stubGlobal('Notification', { requestPermission: vi.fn().mockResolvedValue('granted') });
});

afterEach(() => vi.unstubAllGlobals());

describe('pushService', () => {
  it('detects support', () => {
    expect(isPushSupported()).toBe(true);
  });

  it('returns the existing subscription', async () => {
    pushManager.getSubscription.mockResolvedValue(subscription);
    await expect(getExistingSubscription()).resolves.toBe(subscription);
  });

  it('subscribes and registers with the server', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ publicKey: 'BPk_-A' }), { status: 200 }))
      .mockResolvedValueOnce(new Response('{}', { status: 201 }));
    vi.stubGlobal('fetch', fetchMock);

    await subscribeToPush();

    expect(pushManager.subscribe).toHaveBeenCalledWith(
      expect.objectContaining({ userVisibleOnly: true }),
    );
    expect(String(fetchMock.mock.calls[1][0])).toContain('/push/subscribe');
  });

  it('rejects when permission is denied', async () => {
    vi.stubGlobal('Notification', { requestPermission: vi.fn().mockResolvedValue('denied') });
    await expect(subscribeToPush()).rejects.toThrow('denied');
  });

  it('unsubscribes on the server and the browser', async () => {
    pushManager.getSubscription.mockResolvedValue(subscription);
    const fetchMock = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    await unsubscribeFromPush();

    expect(String(fetchMock.mock.calls[0][0])).toContain('/push/unsubscribe');
    expect(subscription.unsubscribe).toHaveBeenCalled();
  });

  it('does nothing when not subscribed', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await unsubscribeFromPush();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
