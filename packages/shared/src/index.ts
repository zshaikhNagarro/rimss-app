import { z } from 'zod';
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
  /** Units on hand. */
  stock: number;
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
  /** Set when the order was placed while signed in. */
  userId?: string;
}

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export function discountedUnitPrice(price: number, discountPercent: number): number {
  return round2(price * (1 - discountPercent / 100));
}

export { round2 };

// Request schemas: single source of truth for API validation and client typing.
export const productFiltersQuerySchema = z.object({
  q: z.string().max(100).optional(),
  category: z.string().max(50).optional(),
  color: z.string().max(50).optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  discountedOnly: z.enum(['true', 'false']).optional(),
  sort: z.enum(['asc', 'desc']).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
});

export const orderRequestSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1).max(50),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1)
    .max(50),
});
export type OrderRequest = z.infer<typeof orderRequestSchema>;

export const authRequestSchema = z.object({
  email: z
    .email()
    .max(254)
    .transform((e) => e.toLowerCase()),
  // 72 bytes is the practical upper bound for common password hashes.
  password: z.string().min(8).max(72),
});

export const pushSubscriptionSchema = z.object({
  endpoint: z.url().refine((u) => u.startsWith('https://'), 'endpoint must be https'),
  expirationTime: z.number().nullable().optional(),
  keys: z.object({ p256dh: z.string().min(1), auth: z.string().min(1) }),
});

export const pushBroadcastSchema = z.object({
  title: z.string().min(1).max(100).default('RIMSS'),
  body: z.string().max(300).default(''),
  url: z.string().startsWith('/').max(200).default('/'),
});
