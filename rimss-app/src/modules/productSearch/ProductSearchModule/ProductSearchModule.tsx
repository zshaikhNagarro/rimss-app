import { useRef } from 'react';
import { productService } from '../../../services/productService';
import { useAsyncResource } from '../../../hooks/useAsyncResource';
import { useFocusOnGrow } from '../../../hooks/useFocusOnGrow';
import { ProductGrid } from '../../../components/ProductGrid';
import { ProductGridSkeleton } from '../../../components/Skeleton';
import { ErrorFallback } from '../../../components/ErrorFallback';
import { Button } from '../../../components/ui';
import { SearchFilters } from './SearchFilters';
import { useSearchState } from '../useSearchState';
import { useProductResults } from '../useProductResults';
import './ProductSearchModule.scss';
import { useI18n } from '../../../i18n';
import { Slot } from '../../../plugins/Slot';

// Stable reference so memoized values don't recompute on every render while loading.
const EMPTY_META: [string[], string[]] = [[], []];

export function ProductSearchModule() {
  const { t } = useI18n();
  const { state, qInput, setQInput, setFilter, setSort, clearFilters } = useSearchState();
  const { filters, sort: sortDirection } = state;

  const meta = useAsyncResource(
    () => Promise.all([productService.getCategories(), productService.getColors()]),
    [],
  );
  const [categories, colors] = meta.data ?? EMPTY_META;

  const {
    page,
    products: visibleProducts,
    total,
    showMore,
    loadingMore,
  } = useProductResults(state);

  const gridRef = useRef<HTMLDivElement>(null);
  const markFocusTarget = useFocusOnGrow(gridRef, visibleProducts.length);
  const onShowMore = () => {
    markFocusTarget();
    return showMore();
  };

  // Initial skeleton only; later filter changes keep the current grid until results arrive.
  let status: 'error' | 'ready' | 'loading' = 'loading';
  if (page.status === 'error' || meta.status === 'error') status = 'error';
  else if (page.data) status = 'ready';
  const retry = () => {
    page.retry();
    meta.retry();
  };

  return (
    <>
      <Slot name="home-top" />
      <section className="product-search">
        <SearchFilters
          filters={filters}
          sort={sortDirection}
          categories={categories}
          colors={colors}
          suggestions={visibleProducts}
          qInput={qInput}
          onQueryChange={setQInput}
          onFilterChange={setFilter}
          onSortChange={setSort}
          onClear={clearFilters}
        />

        <div className="product-search__results">
          <p className="visually-hidden" role="status" aria-live="polite">
            {status === 'ready' ? t('search.found', { count: total }) : ''}
          </p>
          {status === 'loading' && <ProductGridSkeleton />}
          {status === 'error' && (
            <ErrorFallback
              title={t('search.loadError')}
              message={t('common.checkConnection')}
              onRetry={retry}
            />
          )}
          {status === 'ready' && visibleProducts.length === 0 && (
            <div className="product-search__empty">
              <p>{t('search.empty')}</p>
              <Button variant="outline" onClick={clearFilters}>
                {t('search.reset')}
              </Button>
            </div>
          )}
          {status === 'ready' && visibleProducts.length > 0 && (
            <>
              <ProductGrid
                products={visibleProducts}
                className="product-search__grid"
                gridRef={gridRef}
              />
              {visibleProducts.length < total && (
                <Button variant="outline" disabled={loadingMore} onClick={onShowMore}>
                  {t('search.showMore', { count: total - visibleProducts.length })}
                </Button>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
