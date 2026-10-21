import { useEffect, useState, type SyntheticEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Product } from '../../types/product';
import { productService } from '../../services/productService';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { trackEvent } from '../../services/telemetry';
import { useI18n } from '../../i18n';
import { Input } from '../ui';

/** Header search box with live product suggestions; submitting opens the shop filtered by name. */
export function HeaderSearch() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const debouncedQuery = useDebouncedValue(query.trim(), 250);

  useEffect(() => {
    if (!debouncedQuery) {
      setSuggestions([]);
      return;
    }
    let cancelled = false;
    productService
      .searchPage({ q: debouncedQuery }, 'asc', 0, 6)
      .then((page) => !cancelled && setSuggestions(page.items))
      .catch(() => !cancelled && setSuggestions([]));
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const onSearch = (e: SyntheticEvent) => {
    e.preventDefault();
    const q = query.trim();
    trackEvent('header_search', { length: q.length });
    setOpen(false);
    void navigate(q ? `/?q=${encodeURIComponent(q)}` : '/');
  };

  return (
    <form
      className="header__search"
      role="search"
      onSubmit={onSearch}
      onFocus={() => setOpen(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
    >
      <Input
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        placeholder={t('search.placeholder')}
        aria-label={t('search.byName')}
        autoComplete="off"
      />
      {open && query.trim() && suggestions.length > 0 && (
        <ul className="header__suggestions">
          {suggestions.map((p) => (
            <li key={p.id}>
              <Link
                to={`/product/${p.id}`}
                onClick={() => {
                  trackEvent('header_search_select', { productId: p.id });
                  setOpen(false);
                  setQuery('');
                }}
              >
                {p.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
