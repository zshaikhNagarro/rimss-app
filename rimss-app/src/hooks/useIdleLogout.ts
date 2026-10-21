import { useEffect } from 'react';
import { authService } from '../services/authService';
import { trackEvent } from '../services/telemetry';

const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'] as const;

/** Signs the user out after a period without any activity. */
export function useIdleLogout(active: boolean) {
  useEffect(() => {
    if (!active) return;
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
  }, [active]);
}
