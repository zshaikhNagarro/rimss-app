import type { Product } from '../types/product';

export const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'p1',
  name: 'Wool Sweater',
  category: 'Sweaters',
  color: 'Blue',
  price: 100,
  discountPercent: 0,
  image: '/img/p1.jpg',
  description: 'Warm and cozy.',
  sizes: ['S', 'M', 'L'],
  inStock: true,
  ...overrides,
});
