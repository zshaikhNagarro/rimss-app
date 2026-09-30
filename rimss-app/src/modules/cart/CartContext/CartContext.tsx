import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CartState } from '../../../types/cart';
import type { Product } from '../../../types/product';
import { loadCart, saveCart } from '../cartStorage';
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
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartState>(loadCart);

  useEffect(() => saveCart(cart), [cart]);

  const addProduct = useCallback<CartContextValue['addProduct']>(
    (product, quantity = 1) => setCart((prev) => addToCart(prev, product, quantity)),
    [],
  );
  const removeProduct = useCallback<CartContextValue['removeProduct']>(
    (productId) => setCart((prev) => removeFromCart(prev, productId)),
    [],
  );
  const setQuantity = useCallback<CartContextValue['setQuantity']>(
    (productId, quantity) => setCart((prev) => updateQuantity(prev, productId, quantity)),
    [],
  );

  const clearCart = useCallback(() => setCart({ items: [] }), []);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      itemCount: getCartItemCount(cart),
      total: getCartTotal(cart),
      addProduct,
      removeProduct,
      setQuantity,
      clearCart,
    }),
    [cart, addProduct, removeProduct, setQuantity, clearCart],
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
