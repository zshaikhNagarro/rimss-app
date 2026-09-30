import { useDeferredValue, useMemo, useState } from 'react';
import { productService } from '../../../services/productService';
import { useAsyncResource } from '../../../hooks/useAsyncResource';
import type { Product, ProductFilters } from '../../../types/product';
import { ProductCard } from '../../../components/ProductCard';
import { ProductGridSkeleton } from '../../../components/Skeleton';
import { ErrorFallback } from '../../../components/ErrorFallback';
import { filterProducts, sortByPrice } from '../filterProducts';
import './ProductSearchModule.css';

// Stable reference so memoized values don't recompute on every render while loading.
const EMPTY_CATALOG: [Product[], string[], string[]] = [[], [], []];

export function ProductSearchModule() {
  const [filters, setFilters] = useState<ProductFilters>({});
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const { data, status, retry } = useAsyncResource(
    () =>
      Promise.all([
        productService.search(),
        productService.getCategories(),
        productService.getColors(),
      ]),
    [],
  );
  const [allProducts, categories, colors] = data ?? EMPTY_CATALOG;

  // Empty and false values clear the filter; 0 is kept as a valid max price.
  const setFilter = <K extends keyof ProductFilters>(key: K, value: ProductFilters[K] | '') =>
    setFilters((f) => ({ ...f, [key]: value === '' || value === false ? undefined : value }));

  // Filtering happens client-side against the already-fetched catalog so
  // results update instantly as the user types/toggles filters.
  // Inputs stay responsive; the grid re-filters at lower priority.
  const deferredFilters = useDeferredValue(filters);
  const deferredSort = useDeferredValue(sortDirection);
  const visibleProducts = useMemo(
    () => sortByPrice(filterProducts(allProducts, deferredFilters), deferredSort),
    [allProducts, deferredFilters, deferredSort],
  );

  return (
    <section className="product-search">
      <aside className="product-search__filters">
        <h2>Filters</h2>

        <label className="product-search__field">
          Search by name
          <input
            type="search"
            placeholder="e.g. sweater"
            value={filters.q ?? ''}
            onChange={(e) => setFilter('q', e.target.value)}
          />
        </label>

        <label className="product-search__field">
          Category
          <select
            value={filters.category ?? ''}
            onChange={(e) => setFilter('category', e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="product-search__field">
          Color
          <select value={filters.color ?? ''} onChange={(e) => setFilter('color', e.target.value)}>
            <option value="">All colors</option>
            {colors.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="product-search__field">
          Max price: ${filters.maxPrice ?? 300}
          <input
            type="range"
            min={0}
            max={300}
            step={10}
            value={filters.maxPrice ?? 300}
            onChange={(e) => setFilter('maxPrice', Number(e.target.value))}
          />
        </label>

        <label className="product-search__checkbox">
          <input
            type="checkbox"
            checked={Boolean(filters.discountedOnly)}
            onChange={(e) => setFilter('discountedOnly', e.target.checked)}
          />
          Discounted products only
        </label>

        <label className="product-search__field">
          Sort by price
          <select
            value={sortDirection}
            onChange={(e) => setSortDirection(e.target.value as 'asc' | 'desc')}
          >
            <option value="asc">Low to high</option>
            <option value="desc">High to low</option>
          </select>
        </label>

        <button className="product-search__clear" onClick={() => setFilters({})}>
          Clear filters
        </button>
      </aside>

      <div className="product-search__results">
        {status === 'loading' && <ProductGridSkeleton />}
        {status === 'error' && (
          <ErrorFallback
            title="Unable to load products"
            message="Check your connection and try again."
            onRetry={retry}
          />
        )}
        {status === 'ready' && visibleProducts.length === 0 && (
          <p>No products match the selected filters.</p>
        )}
        {status === 'ready' && visibleProducts.length > 0 && (
          <div className="product-search__grid">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
