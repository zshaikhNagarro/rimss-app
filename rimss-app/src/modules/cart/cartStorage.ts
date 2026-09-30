import type { CartItem, CartState } from '../../types/cart';

export const CART_STORAGE_KEY = 'rimss.cart.v1';

const isCartItem = (v: unknown): v is CartItem => {
  const i = v as CartItem;
  return (
    typeof i === 'object' &&
    i !== null &&
    typeof i.productId === 'string' &&
    typeof i.name === 'string' &&
    Number.isFinite(i.price) &&
    Number.isFinite(i.discountPercent) &&
    Number.isInteger(i.quantity) &&
    i.quantity > 0
  );
};

/** Restores the cart, dropping anything malformed (storage is user-editable). */
export function loadCart(storage: Storage = localStorage): CartState {
  try {
    const parsed = JSON.parse(storage.getItem(CART_STORAGE_KEY) ?? 'null');
    if (Array.isArray(parsed?.items)) return { items: parsed.items.filter(isCartItem) };
  } catch {
    // Unavailable or corrupt storage falls back to an empty cart.
  }
  return { items: [] };
}

export function saveCart(cart: CartState, storage: Storage = localStorage): void {
  try {
    storage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // Quota or private-mode errors must not break shopping.
  }
}
