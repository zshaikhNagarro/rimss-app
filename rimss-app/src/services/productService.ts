import type { Product, ProductFilters } from '../types/product';
import { getJson } from './httpClient';
import { createRequestCache } from './requestCache';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api';

// Short TTL: repeat navigation is instant while the catalog stays reasonably fresh.
const cache = createRequestCache(60_000);

function requestJson<T>(path: string): Promise<T> {
  return cache.get(path, () => getJson<T>(`${API_BASE_URL}${path}`));
}

function buildQueryString(filters: ProductFilters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.category) params.set('category', filters.category);
  if (filters.color) params.set('color', filters.color);
  if (filters.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice));
  if (filters.discountedOnly) params.set('discountedOnly', 'true');
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export const productService = {
  clearCache: () => cache.clear(),
  search(filters: ProductFilters = {}): Promise<Product[]> {
    return requestJson<Product[]>(`/products${buildQueryString(filters)}`);
  },
  getById(id: string): Promise<Product> {
    return requestJson<Product>(`/products/${id}`);
  },
  getCategories(): Promise<string[]> {
    return requestJson<string[]>('/categories');
  },
  getColors(): Promise<string[]> {
    return requestJson<string[]>('/colors');
  },
};
