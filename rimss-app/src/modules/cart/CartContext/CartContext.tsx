import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { CartState } from '../../../types/cart';
import type { Product } from '../../../types/product';
import {
  addToCart,
  getCartItemCount,
  getCartTotal,
  removeFromCart,
  updateQuantity,
} from '../cartLogic';

interface CartContextValue {
  cart: CartState;
  itemCount: number;
  total: number;
  addProduct: (product: Product, quantity?: number) => void;
  removeProduct: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartState>({ items: [] });

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      itemCount: getCartItemCount(cart),
      total: getCartTotal(cart),
      addProduct: (product, quantity = 1) => setCart((prev) => addToCart(prev, product, quantity)),
      removeProduct: (productId) => setCart((prev) => removeFromCart(prev, productId)),
      setQuantity: (productId, quantity) =>
        setCart((prev) => updateQuantity(prev, productId, quantity)),
    }),
    [cart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}
