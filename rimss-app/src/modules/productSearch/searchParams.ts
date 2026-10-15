import type { ProductFilters } from '../../types/product';

export type SortDirection = 'asc' | 'desc';

export interface SearchState {
  filters: ProductFilters;
  sort: SortDirection;
}

export function parseSearchParams(params: URLSearchParams): SearchState {
  const filters: ProductFilters = {};
  const q = params.get('q');
  const category = params.get('category');
  const color = params.get('color');
  const maxPrice = params.get('maxPrice');
  if (q) filters.q = q;
  if (category) filters.category = category;
  if (color) filters.color = color;
  if (maxPrice !== null && maxPrice !== '' && Number.isFinite(Number(maxPrice))) {
    filters.maxPrice = Number(maxPrice);
  }
  if (params.get('discountedOnly') === 'true') filters.discountedOnly = true;
  return { filters, sort: params.get('sort') === 'desc' ? 'desc' : 'asc' };
}

export function toSearchParams({ filters, sort }: SearchState): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.category) params.set('category', filters.category);
  if (filters.color) params.set('color', filters.color);
  if (filters.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice));
  if (filters.discountedOnly) params.set('discountedOnly', 'true');
  if (sort === 'desc') params.set('sort', 'desc');
  return params;
}
