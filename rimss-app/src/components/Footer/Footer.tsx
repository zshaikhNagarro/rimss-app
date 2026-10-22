import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n';
import { useSession } from '../../services/session';
import './Footer.scss';

const LINKS = [{ to: '/account', key: 'nav.account', requiresAuth: true }];

export function Footer() {
  const { t } = useI18n();
  const session = useSession();

  const links = LINKS.filter((l) => !l.requiresAuth || session);

  return (
    <footer className="footer">
      <div className="footer__brand">
        <strong>
          {t('brand.name')} <span>{t('brand.company')}</span>
        </strong>
        <p>{t('footer.tagline')}</p>
      </div>
      {links.length > 0 && (
        <nav className="footer__nav" aria-label={t('footer.links')}>
          {links.map((l) => (
            <Link key={l.to} to={l.to}>
              {t(l.key)}
            </Link>
          ))}
        </nav>
      )}
      <p className="footer__copy">{t('footer.copyright', { year: new Date().getFullYear() })}</p>
    </footer>
  );
}
