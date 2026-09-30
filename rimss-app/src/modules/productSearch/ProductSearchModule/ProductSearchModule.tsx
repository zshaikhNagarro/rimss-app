import { useEffect, useMemo, useState } from 'react';
import { productService } from '../../../services/productService';
import type { Product, ProductFilters } from '../../../types/product';
import { ProductCard } from '../../../components/ProductCard';
import { ProductGridSkeleton } from '../../../components/Skeleton';
import { ErrorFallback } from '../../../components/ErrorFallback';
import { filterProducts, sortByPrice } from '../filterProducts';
import './ProductSearchModule.css';

export function ProductSearchModule() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [filters, setFilters] = useState<ProductFilters>({});
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');

    Promise.all([
      productService.search(),
      productService.getCategories(),
      productService.getColors(),
    ])
      .then(([products, cats, cols]) => {
        if (cancelled) return;
        setAllProducts(products);
        setCategories(cats);
        setColors(cols);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  // Filtering happens client-side against the already-fetched catalog so
  // results update instantly as the user types/toggles filters.
  const visibleProducts = useMemo(
    () => sortByPrice(filterProducts(allProducts, filters), sortDirection),
    [allProducts, filters, sortDirection],
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
            onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value || undefined }))}
          />
        </label>

        <label className="product-search__field">
          Category
          <select
            value={filters.category ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value || undefined }))}
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
          <select
            value={filters.color ?? ''}
            onChange={(e) => setFilters((f) => ({ ...f, color: e.target.value || undefined }))}
          >
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
            onChange={(e) => setFilters((f) => ({ ...f, maxPrice: Number(e.target.value) }))}
          />
        </label>

        <label className="product-search__checkbox">
          <input
            type="checkbox"
            checked={Boolean(filters.discountedOnly)}
            onChange={(e) =>
              setFilters((f) => ({ ...f, discountedOnly: e.target.checked || undefined }))
            }
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
            onRetry={() => setReloadKey((k) => k + 1)}
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
