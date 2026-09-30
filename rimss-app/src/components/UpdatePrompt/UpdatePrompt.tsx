import { useRegisterSW } from 'virtual:pwa-register/react';
import './UpdatePrompt.css';

/** Surfaces the PWA's offline-ready and new-version-available states to the user. */
export function UpdatePrompt() {
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
      <span>
        {needRefresh ? 'A new version of RIMSS is available.' : 'RIMSS is ready to work offline.'}
      </span>
      <div className="update-prompt__actions">
        {needRefresh && <button onClick={() => updateServiceWorker(true)}>Reload</button>}
        <button className="update-prompt__dismiss" onClick={close}>
          Dismiss
        </button>
      </div>
    </div>
  );
}
