import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import type { ModulePlugin } from '../../plugins/PluginRegistry';
import { useI18n } from '../../i18n';
import { useTheme } from '../../hooks/useTheme';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import { useSession } from '../../services/session';
import { authService } from '../../services/authService';
import { trackEvent } from '../../services/telemetry';
import { NotificationToggle } from '../NotificationToggle';
import { Button } from '../ui';
import './AccountMenu.scss';

const ITEMS = '[role="menuitem"]';

/** Avatar menu: signed-in pages, theme, alerts, and sign in/out. */
export function AccountMenu({
  modules,
  onSignInClick,
}: Readonly<{ modules: ModulePlugin[]; onSignInClick?: () => void }>) {
  const { t } = useI18n();
  const session = useSession();
  const [theme, toggleTheme] = useTheme();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEscapeKey(() => setOpen(false), open);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  useEffect(() => {
    if (open) rootRef.current?.querySelector<HTMLElement>(ITEMS)?.focus();
  }, [open]);

  const closeToTrigger = () => {
    setOpen(false);
    rootRef.current?.querySelector<HTMLElement>('[aria-haspopup]')?.focus();
  };

  const onMenuKeyDown = (e: KeyboardEvent) => {
    const items = [...(rootRef.current?.querySelectorAll<HTMLElement>(ITEMS) ?? [])];
    const i = items.indexOf(document.activeElement as HTMLElement);
    const moves: Record<string, number> = {
      ArrowDown: (i + 1) % items.length,
      ArrowUp: (i - 1 + items.length) % items.length,
      Home: 0,
      End: items.length - 1,
    };
    if (e.key in moves) {
      e.preventDefault();
      items[moves[e.key]]?.focus();
    } else if (e.key === 'Escape') {
      e.stopPropagation();
      closeToTrigger();
    } else if (e.key === 'Tab') {
      setOpen(false);
    }
  };

  const accountPages = session ? modules.filter((m) => m.requiresAuth && !m.hideFromNav) : [];
  const initial = session?.email?.[0]?.toUpperCase();

  return (
    <div className="account-menu" ref={rootRef}>
      <button
        type="button"
        className="account-menu__avatar"
        aria-label={t('header.accountMenu')}
        title={session?.email}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setOpen(true);
          }
        }}
      >
        {initial ?? (
          <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="currentColor">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8z" />
          </svg>
        )}
      </button>
      {open && (
        <div
          className="account-menu__list"
          role="menu"
          aria-label={t('header.accountMenu')}
          onKeyDown={onMenuKeyDown}
        >
          {session && <p className="account-menu__email">{session.email}</p>}

          {accountPages.map((m) => (
            <Link
              key={m.id}
              to={m.route}
              role="menuitem"
              className="account-menu__link"
              onClick={() => setOpen(false)}
            >
              {t(`nav.${m.id}`, undefined, m.navLabel)}
            </Link>
          ))}

          <Button
            variant="secondary"
            size="sm"
            role="menuitem"
            className="account-menu__item"
            aria-label={theme === 'dark' ? t('header.themeToLight') : t('header.themeToDark')}
            onClick={() => {
              trackEvent('toggle_theme', { to: theme === 'dark' ? 'light' : 'dark' });
              toggleTheme();
              closeToTrigger();
            }}
          >
            <span aria-hidden="true">{theme === 'dark' ? '\u2600' : '\u263E'}</span>{' '}
            {theme === 'dark' ? t('header.themeLight') : t('header.themeDark')}
          </Button>

          <NotificationToggle menuItem />

          {session ? (
            <Button
              variant="secondary"
              size="sm"
              role="menuitem"
              className="account-menu__item"
              onClick={() => {
                trackEvent('logout');
                authService.logout();
                setOpen(false);
              }}
            >
              {t('account.signOut')}
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              role="menuitem"
              className="account-menu__item"
              onClick={() => {
                setOpen(false);
                onSignInClick?.();
              }}
            >
              {t('header.signIn')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
