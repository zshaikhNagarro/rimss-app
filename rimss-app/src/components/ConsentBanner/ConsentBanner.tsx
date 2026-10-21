import { useState } from 'react';
import { Button } from '../ui';
import { useI18n } from '../../i18n';
import { GA_ID, getConsent, setConsent, type Consent } from '../../services/analytics';
import './ConsentBanner.scss';

/** Asks for analytics consent once; hidden when GA is not configured or a choice exists. */
export function ConsentBanner() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(() => Boolean(GA_ID) && getConsent() === null);
  if (!visible) return null;

  const choose = (value: Consent) => {
    setConsent(value);
    setVisible(false);
  };

  return (
    <section className="consent-banner" aria-label={t('consent.message')}>
      <span>{t('consent.message')}</span>
      <div className="consent-banner__actions">
        <Button variant="ghost" size="sm" onClick={() => choose('denied')}>
          {t('consent.decline')}
        </Button>
        <Button size="sm" onClick={() => choose('granted')}>
          {t('consent.accept')}
        </Button>
      </div>
    </section>
  );
}
