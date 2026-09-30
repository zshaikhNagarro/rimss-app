import type { CartItem, CartState } from '../../../types/cart';
import type { Product } from '../../../types/product';

/**
 * Pure business-layer functions for the shopping cart, kept free of React
 * so they can be unit tested in isolation from the UI.
 */

export function addToCart(state: CartState, product: Product, quantity = 1): CartState {
  const existing = state.items.find((item) => item.productId === product.id);

  if (existing) {
    return {
      items: state.items.map((item) =>
        item.productId === product.id ? { ...item, quantity: item.quantity + quantity } : item,
      ),
    };
  }

  const newItem: CartItem = {
    productId: product.id,
    name: product.name,
    price: product.price,
    discountPercent: product.discountPercent,
    quantity,
  };

  return { items: [...state.items, newItem] };
}

export function removeFromCart(state: CartState, productId: string): CartState {
  return { items: state.items.filter((item) => item.productId !== productId) };
}

export function updateQuantity(state: CartState, productId: string, quantity: number): CartState {
  if (quantity <= 0) {
    return removeFromCart(state, productId);
  }
  return {
    items: state.items.map((item) => (item.productId === productId ? { ...item, quantity } : item)),
  };
}

export function getItemLineTotal(item: CartItem): number {
  const discountedPrice = item.price * (1 - item.discountPercent / 100);
  return Math.round(discountedPrice * item.quantity * 100) / 100;
}

export function getCartTotal(state: CartState): number {
  const total = state.items.reduce((sum, item) => sum + getItemLineTotal(item), 0);
  return Math.round(total * 100) / 100;
}

export function getCartItemCount(state: CartState): number {
  return state.items.reduce((sum, item) => sum + item.quantity, 0);
}
