import { useMemo, useState } from 'react';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { productService } from '../../services/productService';
import { trackEvent } from '../../services/telemetry';
import type { Product } from '../../types/product';
import type { SearchState } from './searchParams';

const NO_PRODUCTS: Product[] = [];
const QUERY_DEBOUNCE_MS = 150;
const PAGE_SIZE = 12;

/** Server-side filtered, sorted and paged product results with "show more" support. */
export function useProductResults(state: SearchState) {
  // Debounced so slider drags don't fire a request per step.
  const queryKey = useDebouncedValue(JSON.stringify(state), QUERY_DEBOUNCE_MS);
  const query = useMemo(() => JSON.parse(queryKey) as SearchState, [queryKey]);
  const page = useAsyncResource(
    () => productService.searchPage(query.filters, query.sort, 0, PAGE_SIZE),
    [queryKey],
  );

  const [more, setMore] = useState<{ key: string; items: Product[] }>({ key: '', items: [] });
  const [loadingMore, setLoadingMore] = useState(false);
  const firstPage = page.data?.items ?? NO_PRODUCTS;
  const products = useMemo(
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
        products.length,
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

  return { page, products, total, showMore, loadingMore };
}
