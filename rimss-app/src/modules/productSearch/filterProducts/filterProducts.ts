import type { Product, ProductFilters } from '../../../types/product';

/**
 * Pure client-side filtering logic for the product search module.
 * Mirrors the mock server's filtering so it can be unit tested without
 * needing a running API, and reused for instant client-side re-filtering.
 */
export function filterProducts(products: Product[], filters: ProductFilters): Product[] {
  return products.filter((product) => {
    if (filters.category && product.category !== filters.category) return false;
    if (filters.color && product.color !== filters.color) return false;
    if (filters.maxPrice !== undefined && product.price > filters.maxPrice) return false;
    if (filters.discountedOnly && product.discountPercent <= 0) return false;
    if (filters.q && !product.name.toLowerCase().includes(filters.q.toLowerCase())) {
      return false;
    }
    return true;
  });
}

export function sortByPrice(products: Product[], direction: 'asc' | 'desc' = 'asc'): Product[] {
  const sorted = [...products].sort((a, b) => a.price - b.price);
  return direction === 'asc' ? sorted : sorted.reverse();
}
