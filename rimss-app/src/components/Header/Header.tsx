import { Link, NavLink } from 'react-router-dom';
import type { ModulePlugin } from '../../plugins/PluginRegistry';
import { useCart } from '../../modules/cart';
import { useIdleLogout } from '../../hooks/useIdleLogout';
import { useSession } from '../../services/session';
import { trackEvent } from '../../services/telemetry';
import { useI18n } from '../../i18n';
import { LanguageMenu } from '../LanguageMenu';
import { AccountMenu } from '../AccountMenu';
import { Button } from '../ui';
import { HeaderSearch } from './HeaderSearch';
import './Header.scss';

export function Header({
  modules,
  onCartClick,
  onSignInClick,
}: Readonly<{
  modules: ModulePlugin[];
  onCartClick: () => void;
  onSignInClick?: () => void;
}>) {
  const session = useSession();
  const { itemCount } = useCart();
  const { t } = useI18n();
  useIdleLogout(Boolean(session));

  return (
    <header className="header">
      <Link to="/" className="header__brand">
        {t('brand.name')} <span>{t('brand.company')}</span>
      </Link>

      <nav className="header__nav">
        {modules
          .filter((m) => !m.hideFromNav && !m.requiresAuth)
          .map((m) => (
            <NavLink key={m.id} to={m.route} end>
              {t(`nav.${m.id}`, undefined, m.navLabel)}
            </NavLink>
          ))}
      </nav>

      <HeaderSearch />

      <div className="header__actions">
        <LanguageMenu />

        <Button
          variant="outline"
          className="header__link"
          onClick={() => {
            trackEvent('open_cart', { items: itemCount });
            onCartClick();
          }}
          aria-label={t('header.openCart')}
        >
          {t('header.cart', { count: itemCount })}
        </Button>

        <AccountMenu modules={modules} onSignInClick={onSignInClick} />
      </div>
    </header>
  );
}
