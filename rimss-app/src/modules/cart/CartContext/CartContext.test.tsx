import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { makeProduct } from '../../../test/fixtures';
import { CartProvider, useCart } from './CartContext';

const wrapper = ({ children }: { children: ReactNode }) => <CartProvider>{children}</CartProvider>;

describe('CartContext', () => {
  it('throws outside a provider', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useCart())).toThrow('CartProvider');
    vi.restoreAllMocks();
  });

  it('starts empty', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.itemCount).toBe(0);
    expect(result.current.total).toBe(0);
  });

  it('adds, updates and removes products', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => result.current.addProduct(makeProduct({ discountPercent: 50 }), 2));
    expect(result.current.itemCount).toBe(2);
    expect(result.current.total).toBe(100);

    act(() => result.current.setQuantity('p1', 3));
    expect(result.current.itemCount).toBe(3);

    act(() => result.current.removeProduct('p1'));
    expect(result.current.cart.items).toHaveLength(0);
  });
});
