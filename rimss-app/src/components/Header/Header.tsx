import { useEffect, useState, type FormEvent } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import type { Product } from '../../types/product';
import { productService } from '../../services/productService';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import type { ModulePlugin } from '../../plugins/PluginRegistry';
import { useCart } from '../../modules/cart';
import { useTheme } from '../../hooks/useTheme';
import { useSession } from '../../services/session';
import { authService } from '../../services/authService';
import { trackEvent } from '../../services/telemetry';
import { useI18n } from '../../i18n';
import { LanguageMenu } from '../LanguageMenu';
import { NotificationToggle } from '../NotificationToggle';
import { Button } from '../ui';
import './Header.scss';

const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'] as const;

export function Header({
  modules,
  onCartClick,
  onSignInClick,
}: {
  modules: ModulePlugin[];
  onCartClick: () => void;
  onSignInClick?: () => void;
}) {
  const session = useSession();
  const { itemCount } = useCart();
  const { t } = useI18n();
  const [theme, toggleTheme] = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const debouncedQuery = useDebouncedValue(query.trim(), 250);
  const signedIn = Boolean(session);

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

  useEffect(() => {
    if (!signedIn) return;
    let timer: ReturnType<typeof setTimeout>;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        trackEvent('logout', { reason: 'inactivity' });
        authService.logout();
      }, IDLE_TIMEOUT_MS);
    };
    reset();
    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    return () => {
      clearTimeout(timer);
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [signedIn]);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    trackEvent('header_search', { length: q.length });
    setOpen(false);
    void navigate(q ? `/?q=${encodeURIComponent(q)}` : '/');
  };

  return (
    <header className="header">
      <Link to="/" className="header__brand">
        {t('brand.name')} <span>{t('brand.company')}</span>
      </Link>

      <nav className="header__nav">
        {modules
          .filter((m) => !m.hideFromNav && (!m.requiresAuth || session))
          .map((m) => (
            <NavLink key={m.id} to={m.route} end>
              {t(`nav.${m.id}`, undefined, m.navLabel)}
            </NavLink>
          ))}
      </nav>

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
        <input
          type="search"
          className="ui-control"
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

      <div className="header__actions">
        <LanguageMenu />

        <Button
          variant="outline"
          onClick={() => {
            trackEvent('toggle_theme', { to: theme === 'dark' ? 'light' : 'dark' });
            toggleTheme();
          }}
          aria-label={theme === 'dark' ? t('header.themeToLight') : t('header.themeToDark')}
          title={theme === 'dark' ? t('header.themeLight') : t('header.themeDark')}
        >
          <span aria-hidden="true">{theme === 'dark' ? '\u2600' : '\u263E'}</span>{' '}
          {theme === 'dark' ? t('header.themeLight') : t('header.themeDark')}
        </Button>

        <NotificationToggle />

        <Button
          variant="outline"
          onClick={() => {
            trackEvent('open_cart', { items: itemCount });
            onCartClick();
          }}
          aria-label={t('header.openCart')}
        >
          {t('header.cart', { count: itemCount })}
        </Button>

        {session ? (
          <Button
            variant="outline"
            onClick={() => {
              trackEvent('logout');
              authService.logout();
            }}
          >
            {t('account.signOut')}
          </Button>
        ) : (
          <Button variant="outline" onClick={onSignInClick}>
            {t('header.signIn')}
          </Button>
        )}
      </div>
    </header>
  );
}
