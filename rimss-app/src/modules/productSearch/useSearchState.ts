import { useEffect, useState } from 'react';
import { useNavigationType, useSearchParams } from 'react-router-dom';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { trackEvent } from '../../services/telemetry';
import type { ProductFilters } from '../../types/product';
import {
  parseSearchParams,
  toSearchParams,
  type SearchState,
  type SortDirection,
} from './searchParams';

const SEARCH_DEBOUNCE_MS = 250;

/**
 * Filter/sort/search-text state. Local state drives the controls so they respond
 * instantly; the URL mirrors it so views are shareable and survive a reload.
 */
export function useSearchState() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigationType = useNavigationType();
  const [state, setState] = useState<SearchState>(() => parseSearchParams(searchParams));
  const [qInput, setQInput] = useState(state.filters.q ?? '');
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

  const clearFilters = () => {
    trackEvent('clear_filters');
    setQInput('');
    setState({ filters: {}, sort: 'asc' });
  };

  return { state, qInput, setQInput, setFilter, setSort, clearFilters };
}
