import { useRegisterSW } from 'virtual:pwa-register/react';
import { Button } from '../ui';
import { useI18n } from '../../i18n';
import './UpdatePrompt.scss';

/** Surfaces the PWA's offline-ready and new-version-available states to the user. */
export function UpdatePrompt() {
  const { t } = useI18n();
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      void registration?.update();
    },
  });

  if (!offlineReady && !needRefresh) return null;

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  return (
    <div className="update-prompt" role="status">
      <span>{needRefresh ? t('update.available') : t('update.offline')}</span>
      <div className="update-prompt__actions">
        {needRefresh && (
          <Button size="sm" onClick={() => updateServiceWorker(true)}>
            {t('update.reload')}
          </Button>
        )}
        <Button variant="ghost" size="sm" className="update-prompt__dismiss" onClick={close}>
          {t('update.dismiss')}
        </Button>
      </div>
    </div>
  );
}
