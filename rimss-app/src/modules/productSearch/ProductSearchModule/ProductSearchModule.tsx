import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { useNavigationType, useSearchParams } from 'react-router-dom';
import { productService } from '../../../services/productService';
import { useAsyncResource } from '../../../hooks/useAsyncResource';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import type { Product, ProductFilters } from '../../../types/product';
import { ProductCard } from '../../../components/ProductCard';
import { ProductGridSkeleton } from '../../../components/Skeleton';
import { ErrorFallback } from '../../../components/ErrorFallback';
import { Button, Card, Field, Heading, Input, Select } from '../../../components/ui';
import { filterProducts, sortByPrice } from '../filterProducts';
import {
  parseSearchParams,
  toSearchParams,
  type SearchState,
  type SortDirection,
} from '../searchParams';
import './ProductSearchModule.scss';
import { useI18n } from '../../../i18n';

// Stable reference so memoized values don't recompute on every render while loading.
const EMPTY_CATALOG: [Product[], string[], string[]] = [[], [], []];
const SEARCH_DEBOUNCE_MS = 250;
const PAGE_SIZE = 12;

export function ProductSearchModule() {
  const { t } = useI18n();
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

  const [shown, setShown] = useState(PAGE_SIZE);
  useEffect(() => setShown(PAGE_SIZE), [deferredFilters, deferredSort]);

  return (
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
            {allProducts.map((p) => (
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
          <Select value={filters.color ?? ''} onChange={(e) => setFilter('color', e.target.value)}>
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
          <Select value={sortDirection} onChange={(e) => setSort(e.target.value as SortDirection)}>
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
          {status === 'ready' ? t('search.found', { count: visibleProducts.length }) : ''}
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
              {visibleProducts.slice(0, shown).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {shown < visibleProducts.length && (
              <Button variant="outline" onClick={() => setShown((n) => n + PAGE_SIZE)}>
                {t('search.showMore', { count: visibleProducts.length - shown })}
              </Button>
            )}
          </>
        )}
      </div>
    </section>
  );
}
