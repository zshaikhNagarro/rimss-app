import { orderRequestSchema } from '@rimss/shared';
import { Router } from 'express';
import { HttpError } from '../errors.js';
import { buildQuote } from '../orders.js';
import type { OrderStore } from '../orders.js';
import type { ProductRepository } from '../products.js';

export function orderRoutes(products: ProductRepository, orders: OrderStore): Router {
  const router = Router();

  // Server-side pricing: the client sends ids and quantities only.
  router.post('/cart/quote', async (req, res) => {
    const { items } = orderRequestSchema.parse(req.body);
    res.json(await buildQuote(products, items));
  });

  router.post('/orders', async (req, res) => {
    const { items } = orderRequestSchema.parse(req.body);
    res.status(201).json(await orders.create(await buildQuote(products, items)));
  });

  router.get('/orders/:id', async (req, res) => {
    const order = await orders.get(req.params.id);
    if (!order) throw new HttpError(404, 'ORDER_NOT_FOUND', 'Order not found');
    res.json(order);
  });

  return router;
}
