import { beforeEach, describe, expect, it } from 'vitest';
import { CART_STORAGE_KEY, loadCart, saveCart } from './cartStorage';

const item = {
  productId: 'p1',
  name: 'Hat',
  price: 10,
  discountPercent: 0,
  quantity: 2,
};

beforeEach(() => localStorage.clear());

describe('cartStorage', () => {
  it('round-trips a cart', () => {
    saveCart({ items: [item] });
    expect(loadCart()).toEqual({ items: [item] });
  });

  it('returns an empty cart when nothing is stored', () => {
    expect(loadCart()).toEqual({ items: [] });
  });

  it('ignores corrupt JSON', () => {
    localStorage.setItem(CART_STORAGE_KEY, '{nope');
    expect(loadCart()).toEqual({ items: [] });
  });

  it('drops malformed items', () => {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({ items: [item, { productId: 1 }, { ...item, quantity: -1 }, null] }),
    );
    expect(loadCart().items).toEqual([item]);
  });
});
