import { afterEach, describe, expect, it, vi } from 'vitest';
import { orderService } from './orderService';

afterEach(() => vi.unstubAllGlobals());

const cart = {
  items: [{ productId: 'p1', name: 'Hat', price: 10, discountPercent: 5, quantity: 2 }],
};

describe('orderService', () => {
  it('posts only ids and quantities', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 'o1' })));
    vi.stubGlobal('fetch', fetchMock);
    await expect(orderService.createOrder(cart)).resolves.toEqual({ id: 'o1' });
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toMatch(/\/orders$/);
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({ items: [{ productId: 'p1', quantity: 2 }] });
  });

  it('rejects on HTTP errors without retrying', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response('', { status: 503 }));
    vi.stubGlobal('fetch', fetchMock);
    await expect(orderService.createOrder(cart)).rejects.toThrow('503');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
