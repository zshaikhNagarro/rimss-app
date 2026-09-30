// Contract shared by the web app and the API. Single file so no relative-import extensions are needed.

export interface Product {
  id: string;
  name: string;
  category: string;
  color: string;
  price: number;
  discountPercent: number;
  image: string;
  description: string;
  sizes: string[];
  inStock: boolean;
}

export interface ProductFilters {
  q?: string;
  category?: string;
  color?: string;
  maxPrice?: number;
  discountedOnly?: boolean;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  discountPercent: number;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
}

export interface OrderLineInput {
  productId: string;
  quantity: number;
}

export interface OrderLine {
  productId: string;
  quantity: number;
  name: string;
  discountPercent: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Quote {
  lines: OrderLine[];
  subtotal: number;
  discountTotal: number;
  total: number;
}

export type OrderStatus = 'PENDING_PAYMENT' | 'PAID' | 'CANCELLED';

export interface Order extends Quote {
  id: string;
  status: OrderStatus;
  createdAt: string;
}

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export function discountedUnitPrice(price: number, discountPercent: number): number {
  return round2(price * (1 - discountPercent / 100));
}

export { round2 };
