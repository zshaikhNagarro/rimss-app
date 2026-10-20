import { productFiltersQuerySchema } from '@rimss/shared';
import { Router } from 'express';
import { HttpError } from '../errors.js';
import type { ProductRepository } from '../products.js';

export function catalogRoutes(products: ProductRepository): Router {
  const router = Router();

  router.get('/products', async (req, res) => {
    const { limit, offset = 0, ...f } = productFiltersQuerySchema.parse(req.query);
    const all = await products.search({ ...f, discountedOnly: f.discountedOnly === 'true' });
    res.set('X-Total-Count', String(all.length));
    res.json(limit === undefined ? all.slice(offset) : all.slice(offset, offset + limit));
  });

  router.get('/products/:id', async (req, res) => {
    const product = await products.byId(req.params.id);
    if (!product) throw new HttpError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
    res.json(product);
  });

  router.get('/categories', async (_req, res) => res.json(await products.categories()));
  router.get('/colors', async (_req, res) => res.json(await products.colors()));

  return router;
}
