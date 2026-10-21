import { useEffect, useState } from 'react';
import { Button } from '../ui';
import { useI18n } from '../../i18n';
import {
  getExistingSubscription,
  isPushSupported,
  subscribeToPush,
  unsubscribeFromPush,
} from '../../services/pushService';
import { trackEvent } from '../../services/telemetry';

/** Lets the user opt in/out of push notifications (offers, restocks). */
export function NotificationToggle() {
  const { t } = useI18n();
  const supported = isPushSupported();
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supported) return;
    getExistingSubscription()
      .then((s) => setEnabled(!!s))
      .catch(() => {});
  }, [supported]);

  if (!supported) return null;

  const toggle = async () => {
    setBusy(true);
    setError(null);
    try {
      if (enabled) await unsubscribeFromPush();
      else await subscribeToPush();
      trackEvent(enabled ? 'notifications_disabled' : 'notifications_enabled');
      setEnabled(!enabled);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('common.somethingWrong'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={toggle}
      disabled={busy}
      title={error ?? undefined}
      aria-label={enabled ? t('notify.disable') : t('notify.enable')}
    >
      {error ? t('notify.error') : enabled ? t('notify.on') : t('notify.off')}
    </Button>
  );
}
