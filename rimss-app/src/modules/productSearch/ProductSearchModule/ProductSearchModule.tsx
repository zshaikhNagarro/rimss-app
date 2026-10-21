import { useEffect, useMemo, useState } from 'react';
import { useNavigationType, useSearchParams } from 'react-router-dom';
import { productService } from '../../../services/productService';
import { useAsyncResource } from '../../../hooks/useAsyncResource';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import type { Product, ProductFilters } from '../../../types/product';
import { ProductCard } from '../../../components/ProductCard';
import { ProductGridSkeleton } from '../../../components/Skeleton';
import { ErrorFallback } from '../../../components/ErrorFallback';
import { Button, Card, Field, Heading, Input, Select } from '../../../components/ui';
import {
  parseSearchParams,
  toSearchParams,
  type SearchState,
  type SortDirection,
} from '../searchParams';
import './ProductSearchModule.scss';
import { useI18n } from '../../../i18n';
import { trackEvent } from '../../../services/telemetry';
import { Slot } from '../../../plugins/Slot';

// Stable reference so memoized values don't recompute on every render while loading.
const EMPTY_META: [string[], string[]] = [[], []];
const NO_PRODUCTS: Product[] = [];
const SEARCH_DEBOUNCE_MS = 250;
const QUERY_DEBOUNCE_MS = 150;
const PAGE_SIZE = 12;

export function ProductSearchModule() {
  const { t } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigationType = useNavigationType();

  // Local state drives the controls so they respond instantly; the URL mirrors it
  // so views are shareable and survive a reload.
  const [state, setState] = useState<SearchState>(() => parseSearchParams(searchParams));
  const { filters, sort: sortDirection } = state;

  const meta = useAsyncResource(
    () => Promise.all([productService.getCategories(), productService.getColors()]),
    [],
  );
  const [categories, colors] = meta.data ?? EMPTY_META;

  // Empty and false values clear the filter; 0 is kept as a valid max price.
  const setFilter = <K extends keyof ProductFilters>(key: K, value: ProductFilters[K] | '') => {
    trackEvent('filter_products', { filter: key });
    setState((s) => ({
      ...s,
      filters: { ...s.filters, [key]: value === '' || value === false ? undefined : value },
    }));
  };
  const setSort = (sort: SortDirection) => {
    trackEvent('sort_products', { sort });
    setState((s) => ({ ...s, sort }));
  };

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
    trackEvent('clear_filters');
    setQInput('');
    setState({ filters: {}, sort: 'asc' });
  };

  // Filtering, sorting and paging happen on the API; this debounce keeps slider drags from
  // firing a request per step.
  const queryKey = useDebouncedValue(JSON.stringify(state), QUERY_DEBOUNCE_MS);
  const query = useMemo(() => JSON.parse(queryKey) as SearchState, [queryKey]);
  const page = useAsyncResource(
    () => productService.searchPage(query.filters, query.sort, 0, PAGE_SIZE),
    [queryKey],
  );

  const [more, setMore] = useState<{ key: string; items: Product[] }>({ key: '', items: [] });
  const [loadingMore, setLoadingMore] = useState(false);
  const firstPage = page.data?.items ?? NO_PRODUCTS;
  const visibleProducts = useMemo(
    () => (more.key === queryKey ? [...firstPage, ...more.items] : firstPage),
    [firstPage, more, queryKey],
  );
  const total = page.data?.total ?? 0;

  const showMore = async () => {
    trackEvent('show_more');
    setLoadingMore(true);
    try {
      const next = await productService.searchPage(
        query.filters,
        query.sort,
        visibleProducts.length,
        PAGE_SIZE,
      );
      setMore({
        key: queryKey,
        items: [...(more.key === queryKey ? more.items : []), ...next.items],
      });
    } catch {
      // The button stays available so the user can try again.
    } finally {
      setLoadingMore(false);
    }
  };

  // Initial skeleton only; later filter changes keep the current grid until results arrive.
  const status =
    page.status === 'error' || meta.status === 'error' ? 'error' : page.data ? 'ready' : 'loading';
  const retry = () => {
    page.retry();
    meta.retry();
  };

  return (
    <>
      <Slot name="home-top" />
      <section className="product-search">
        <Card as="aside" variant="filled" padding="md" className="product-search__filters">
          <Heading level={2}>{t('search.filters')}</Heading>

          <Field>
            {t('search.byName')}
            <Input
              type="search"
              placeholder={t('search.placeholder')}
              list="product-name-suggestions"
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
            />
            <datalist id="product-name-suggestions">
              {visibleProducts.map((p) => (
                <option key={p.id} value={p.name} />
              ))}
            </datalist>
          </Field>

          <Field>
            {t('search.category')}
            <Select
              value={filters.category ?? ''}
              onChange={(e) => setFilter('category', e.target.value)}
            >
              <option value="">{t('search.allCategories')}</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>

          <Field>
            {t('search.color')}
            <Select
              value={filters.color ?? ''}
              onChange={(e) => setFilter('color', e.target.value)}
            >
              <option value="">{t('search.allColors')}</option>
              {colors.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>

          <Field>
            {t('search.maxPrice', { price: filters.maxPrice ?? 300 })}
            <Input
              type="range"
              min={0}
              max={300}
              step={10}
              value={filters.maxPrice ?? 300}
              onChange={(e) => setFilter('maxPrice', Number(e.target.value))}
            />
          </Field>

          <Field inline>
            <input
              type="checkbox"
              checked={Boolean(filters.discountedOnly)}
              onChange={(e) => setFilter('discountedOnly', e.target.checked)}
            />
            {t('search.discountedOnly')}
          </Field>

          <Field>
            {t('search.sortByPrice')}
            <Select
              value={sortDirection}
              onChange={(e) => setSort(e.target.value as SortDirection)}
            >
              <option value="asc">{t('search.lowToHigh')}</option>
              <option value="desc">{t('search.highToLow')}</option>
            </Select>
          </Field>

          <Button variant="outline" onClick={clearFilters}>
            {t('search.clear')}
          </Button>
        </Card>

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
              <div className="product-search__grid">
                {visibleProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {visibleProducts.length < total && (
                <Button variant="outline" disabled={loadingMore} onClick={showMore}>
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
