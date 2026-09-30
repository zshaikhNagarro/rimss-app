import { describe, expect, it } from 'vitest';
import {
  addToCart,
  getCartItemCount,
  getCartTotal,
  getItemLineTotal,
  removeFromCart,
  updateQuantity,
} from './cartLogic';
import type { CartState } from '../../../types/cart';
import type { Product } from '../../../types/product';

const product: Product = {
  id: 'p001',
  name: 'Heritage Wool Sweater',
  category: 'Sweaters',
  color: 'Charcoal',
  price: 100,
  discountPercent: 10,
  image: '',
  description: '',
  sizes: ['M'],
  inStock: true,
};

const emptyState: CartState = { items: [] };

describe('cartLogic', () => {
  it('adds a new product to an empty cart', () => {
    const result = addToCart(emptyState, product, 2);
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({ productId: 'p001', quantity: 2 });
  });

  it('increments quantity when the same product is added again', () => {
    const afterFirstAdd = addToCart(emptyState, product, 1);
    const afterSecondAdd = addToCart(afterFirstAdd, product, 3);
    expect(afterSecondAdd.items).toHaveLength(1);
    expect(afterSecondAdd.items[0].quantity).toBe(4);
  });

  it('removes a product from the cart', () => {
    const withProduct = addToCart(emptyState, product, 1);
    const result = removeFromCart(withProduct, 'p001');
    expect(result.items).toHaveLength(0);
  });

  it('removes the item when quantity is updated to zero or less', () => {
    const withProduct = addToCart(emptyState, product, 1);
    const result = updateQuantity(withProduct, 'p001', 0);
    expect(result.items).toHaveLength(0);
  });

  it('calculates the discounted line total for an item', () => {
    const withProduct = addToCart(emptyState, product, 2);
    expect(getItemLineTotal(withProduct.items[0])).toBe(180); // 100 * 0.9 * 2
  });

  it('calculates the cart total across multiple items', () => {
    const secondProduct: Product = { ...product, id: 'p002', price: 50, discountPercent: 0 };
    let state = addToCart(emptyState, product, 1); // 90
    state = addToCart(state, secondProduct, 1); // 50
    expect(getCartTotal(state)).toBe(140);
  });

  it('counts total item quantity in the cart', () => {
    let state = addToCart(emptyState, product, 2);
    state = addToCart(state, { ...product, id: 'p002' }, 3);
    expect(getCartItemCount(state)).toBe(5);
  });
});
