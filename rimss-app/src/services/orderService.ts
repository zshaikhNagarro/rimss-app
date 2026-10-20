import type { CartState } from '../types/cart';
import type { Order } from '../types/order';
import { getJson, postJson } from './httpClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api';

export const orderService = {
  /** Sends ids and quantities only; the server prices the order. */
  createOrder(cart: CartState): Promise<Order> {
    const items = cart.items.map(({ productId, quantity }) => ({ productId, quantity }));
    return postJson<Order>(`${API_BASE_URL}/orders`, { items });
  },
  /** Requires a signed-in session. */
  listOrders(): Promise<Order[]> {
    return getJson<Order[]>(`${API_BASE_URL}/orders`, { retries: 0 });
  },
  pay: (id: string) => postJson<Order>(`${API_BASE_URL}/orders/${id}/pay`, {}),
  cancel: (id: string) => postJson<Order>(`${API_BASE_URL}/orders/${id}/cancel`, {}),
};
