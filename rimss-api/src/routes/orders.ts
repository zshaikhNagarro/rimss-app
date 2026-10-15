import { orderRequestSchema } from '@rimss/shared';
import { Router } from 'express';
import { z } from 'zod';
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

export function orderRoutes(products: ProductRepository, orders: OrderStore): Router {
  const router = Router();

  // Server-side pricing: the client sends ids and quantities only.
  router.post('/cart/quote', async (req, res) => {
    const { items } = orderRequestSchema.parse(req.body);
    res.json(await buildQuote(products, items));
  });

  router.post('/orders', async (req, res) => {
    const { items } = orderRequestSchema.parse(req.body);
    const key = idempotencyKeySchema.parse(req.header('idempotency-key'));
    const replay = key ? await orders.findByIdempotencyKey(key) : undefined;
    if (replay) return res.status(200).json(replay);
    res.status(201).json(await orders.create(await buildQuote(products, items), key));
  });

  router.get('/orders/:id', async (req, res) => {
    const order = await orders.get(req.params.id);
    if (!order) throw new HttpError(404, 'ORDER_NOT_FOUND', 'Order not found');
    res.json(order);
  });

  return router;
}
