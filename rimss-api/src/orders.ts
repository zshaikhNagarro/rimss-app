import { randomUUID } from 'node:crypto';
import { discountedUnitPrice, round2 } from '@rimss/shared';
import type { Order, OrderLineInput, Quote } from '@rimss/shared';
import { HttpError } from './errors.js';
import type { ProductRepository } from './products.js';

// Prices always come from the catalog, never from the client.
export async function buildQuote(repo: ProductRepository, items: OrderLineInput[]): Promise<Quote> {
  const merged = new Map<string, number>();
  for (const { productId, quantity } of items) {
    merged.set(productId, (merged.get(productId) ?? 0) + quantity);
  }

  const found = new Map((await repo.byIds([...merged.keys()])).map((p) => [p.id, p]));
  let subtotal = 0;

  const lines = [...merged].map(([productId, quantity]) => {
    const product = found.get(productId);
    if (!product) throw new HttpError(422, 'UNKNOWN_PRODUCT', `Unknown product: ${productId}`);
    if (!product.inStock)
      throw new HttpError(409, 'OUT_OF_STOCK', `${product.name} is out of stock`);
    const unitPrice = discountedUnitPrice(product.price, product.discountPercent);
    subtotal += product.price * quantity;
    return {
      productId,
      quantity,
      name: product.name,
      discountPercent: product.discountPercent,
      unitPrice,
      lineTotal: round2(unitPrice * quantity),
    };
  });

  const total = round2(lines.reduce((s, l) => s + l.lineTotal, 0));
  subtotal = round2(subtotal);
  return { lines, subtotal, discountTotal: round2(subtotal - total), total };
}

export interface OrderStore {
  /** A repeated idempotencyKey returns the order created by the first call. */
  create(quote: Quote, idempotencyKey?: string): Promise<Order>;
  findByIdempotencyKey(key: string): Promise<Order | undefined>;
  get(id: string): Promise<Order | undefined>;
}

export function newOrder(quote: Quote): Order {
  return {
    ...quote,
    id: randomUUID(),
    status: 'PENDING_PAYMENT',
    createdAt: new Date().toISOString(),
  };
}

export function createMemoryOrderStore(): OrderStore {
  const orders = new Map<string, Order>();
  const byKey = new Map<string, Order>();
  return {
    async create(quote, idempotencyKey) {
      const existing = idempotencyKey ? byKey.get(idempotencyKey) : undefined;
      if (existing) return existing;
      const order = newOrder(quote);
      orders.set(order.id, order);
      if (idempotencyKey) byKey.set(idempotencyKey, order);
      return order;
    },
    findByIdempotencyKey: async (key) => byKey.get(key),
    get: async (id) => orders.get(id),
  };
}
