import { useEffect, useState } from 'react';
import {
  getExistingSubscription,
  isPushSupported,
  subscribeToPush,
  unsubscribeFromPush,
} from '../../services/pushService';

/** Lets the user opt in/out of push notifications (offers, restocks). */
export function NotificationToggle() {
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
      setEnabled(!enabled);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      className="header__cart-btn"
      onClick={toggle}
      disabled={busy}
      title={error ?? undefined}
      aria-label={enabled ? 'Disable notifications' : 'Enable notifications'}
    >
      {error ? 'Alerts: error' : enabled ? 'Alerts: On' : 'Alerts: Off'}
    </button>
  );
}
