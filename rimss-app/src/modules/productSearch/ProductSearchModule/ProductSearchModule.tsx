import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useNavigationType, useSearchParams } from 'react-router-dom';
import { productService } from '../../../services/productService';
import { useAsyncResource } from '../../../hooks/useAsyncResource';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import type { Product, ProductFilters } from '../../../types/product';
import { ProductCard } from '../../../components/ProductCard';
import { ProductGridSkeleton } from '../../../components/Skeleton';
import { ErrorFallback } from '../../../components/ErrorFallback';
import { filterProducts, sortByPrice } from '../filterProducts';
import {
  parseSearchParams,
  toSearchParams,
  type SearchState,
  type SortDirection,
} from '../searchParams';
import './ProductSearchModule.css';

// Stable reference so memoized values don't recompute on every render while loading.
const EMPTY_CATALOG: [Product[], string[], string[]] = [[], [], []];
const SEARCH_DEBOUNCE_MS = 250;

export function ProductSearchModule() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigationType = useNavigationType();

  // Local state drives the controls so they respond instantly; the URL mirrors it
  // so views are shareable and survive a reload.
  const [state, setState] = useState<SearchState>(() => parseSearchParams(searchParams));
  const { filters, sort: sortDirection } = state;

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
    setState((s) => ({
      ...s,
      filters: { ...s.filters, [key]: value === '' || value === false ? undefined : value },
    }));
  const setSort = (sort: SortDirection) => setState((s) => ({ ...s, sort }));

  const [qInput, setQInput] = useState(filters.q ?? '');
  const debouncedQ = useDebouncedValue(qInput, SEARCH_DEBOUNCE_MS);
  useEffect(() => {
    setState((s) =>
      (s.filters.q ?? '') === debouncedQ
        ? s
        : { ...s, filters: { ...s.filters, q: debouncedQ || undefined } },
    );
  }, [debouncedQ]);

  useEffect(() => {
    const next = toSearchParams(state).toString();
    if (next !== searchParams.toString()) setSearchParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // Only back/forward (POP) navigation should overwrite local state from the URL.
  useEffect(() => {
    if (navigationType !== 'POP') return;
    const fromUrl = parseSearchParams(searchParams);
    if (toSearchParams(fromUrl).toString() === toSearchParams(state).toString()) return;
    setState(fromUrl);
    setQInput(fromUrl.filters.q ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const clearFilters = () => {
    setQInput('');
    setState({ filters: {}, sort: 'asc' });
  };

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
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
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
          <select value={sortDirection} onChange={(e) => setSort(e.target.value as SortDirection)}>
            <option value="asc">Low to high</option>
            <option value="desc">High to low</option>
          </select>
        </label>

        <button className="product-search__clear" onClick={clearFilters}>
          Clear filters
        </button>
      </aside>

      <div className="product-search__results">
        <p className="visually-hidden" role="status" aria-live="polite">
          {status === 'ready' ? `${visibleProducts.length} products found` : ''}
        </p>
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
