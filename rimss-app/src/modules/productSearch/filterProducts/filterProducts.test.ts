import { describe, expect, it } from 'vitest';
import { filterProducts, sortByPrice } from './filterProducts';
import type { Product } from '../../../types/product';

const products: Product[] = [
  {
    id: 'p001',
    name: 'Heritage Wool Sweater',
    category: 'Sweaters',
    color: 'Charcoal',
    price: 129,
    discountPercent: 15,
    image: '',
    description: '',
    sizes: [],
    inStock: true,
  },
  {
    id: 'p002',
    name: 'Moleskin Field Jacket',
    category: 'Jackets',
    color: 'Olive',
    price: 249,
    discountPercent: 0,
    image: '',
    description: '',
    sizes: [],
    inStock: true,
  },
  {
    id: 'p003',
    name: 'Corduroy Trousers',
    category: 'Trousers',
    color: 'Tan',
    price: 89,
    discountPercent: 20,
    image: '',
    description: '',
    sizes: [],
    inStock: true,
  },
];

describe('filterProducts', () => {
  it('returns all products when no filters are provided', () => {
    expect(filterProducts(products, {})).toHaveLength(3);
  });

  it('filters by category', () => {
    const result = filterProducts(products, { category: 'Jackets' });
    expect(result).toEqual([products[1]]);
  });

  it('filters by maximum price', () => {
    const result = filterProducts(products, { maxPrice: 100 });
    expect(result).toEqual([products[2]]);
  });

  it('filters by discounted products only', () => {
    const result = filterProducts(products, { discountedOnly: true });
    expect(result.map((p) => p.id)).toEqual(['p001', 'p003']);
  });

  it('filters by name search term, case-insensitively', () => {
    const result = filterProducts(products, { q: 'jacket' });
    expect(result).toEqual([products[1]]);
  });

  it('combines multiple filters', () => {
    const result = filterProducts(products, { discountedOnly: true, maxPrice: 100 });
    expect(result).toEqual([products[2]]);
  });
});

describe('sortByPrice', () => {
  it('sorts ascending by default', () => {
    const result = sortByPrice(products);
    expect(result.map((p) => p.id)).toEqual(['p003', 'p001', 'p002']);
  });

  it('sorts descending when requested', () => {
    const result = sortByPrice(products, 'desc');
    expect(result.map((p) => p.id)).toEqual(['p002', 'p001', 'p003']);
  });
});
