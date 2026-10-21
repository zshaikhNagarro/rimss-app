import { Link, NavLink } from 'react-router-dom';
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
