import { orderRequestSchema } from '@rimss/shared';
import type { OrderStatus } from '@rimss/shared';
import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import { requireAuth } from '../auth.js';
import { HttpError } from '../errors.js';
import { buildQuote } from '../orders.js';
import type { OrderStore } from '../orders.js';
import type { ProductRepository } from '../products.js';

// Optional client-generated key that makes retried POST /orders safe.
const idempotencyKeySchema = z
  .string()
  .min(8)
  .max(100)
  .regex(/^[\w.:-]+$/)
  .optional();

export function orderRoutes(
  products: ProductRepository,
  orders: OrderStore,
  requireAuthToOrder = false,
): Router {
  const router = Router();

  // Orders owned by a user are hidden (404) from everyone else; guest orders stay id-addressed.
  const ownedOrder = async (req: Request) => {
    const order = await orders.get(req.params.id as string);
    if (!order || (order.userId && order.userId !== req.userId))
      throw new HttpError(404, 'ORDER_NOT_FOUND', 'Order not found');
    return order;
  };
  // Server-side pricing: the client sends ids and quantities only.
  router.post('/cart/quote', async (req, res) => {
    const { items } = orderRequestSchema.parse(req.body);
    res.json(await buildQuote(products, items));
  });

  router.post('/orders', ...(requireAuthToOrder ? [requireAuth] : []), async (req, res) => {
    const { items } = orderRequestSchema.parse(req.body);
    const key = idempotencyKeySchema.parse(req.header('idempotency-key'));
    const replay = key ? await orders.findByIdempotencyKey(key) : undefined;
    if (replay) return res.status(200).json(replay);
    res.status(201).json(await orders.create(await buildQuote(products, items), key, req.userId));
  });

  router.get('/orders', requireAuth, async (req, res) => {
    res.json(await orders.listByUser(req.userId as string));
  });

  router.get('/orders/:id', async (req, res) => {
    res.json(await ownedOrder(req));
  });

  // Mock payment: the real gateway is out of scope, so this only drives the status.
  const transition =
    (from: OrderStatus, to: OrderStatus) => async (req: Request, res: Response) => {
      const order = await ownedOrder(req);
      if (order.status === to) return res.json(order);
      if (order.status !== from)
        throw new HttpError(409, 'INVALID_STATE', `Order is ${order.status}, expected ${from}`);
      res.json(await orders.setStatus(order.id, to));
    };
  router.post('/orders/:id/pay', transition('PENDING_PAYMENT', 'PAID'));
  router.post('/orders/:id/cancel', transition('PENDING_PAYMENT', 'CANCELLED'));

  return router;
}
