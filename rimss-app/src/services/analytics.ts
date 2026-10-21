declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let enabled = false;

const CONSENT_KEY = 'rimss.analytics-consent';
export type Consent = 'granted' | 'denied';
export const GA_ID: string | undefined = import.meta.env.VITE_GA_MEASUREMENT_ID || undefined;

export function getConsent(): Consent | null {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === 'granted' || v === 'denied' ? v : null;
  } catch {
    return null;
  }
}

/** Persists the choice; granting loads GA, denying stops further events. */
export function setConsent(value: Consent): void {
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {
    // Storage unavailable: the choice only lasts for this session.
  }
  if (value === 'granted') initAnalytics(GA_ID);
  else enabled = false;
}

/** Loads GA4 when a measurement id (G-XXXX) is configured. Call once at startup. */
export function initAnalytics(measurementId?: string): void {
  if (!measurementId || enabled || typeof document === 'undefined') return;
  enabled = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // GA requires the `arguments` object, not a rest array.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, { send_page_view: false });
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);
}

export function sendGaEvent(name: string, props?: Record<string, unknown>): void {
  if (!enabled || !window.gtag) return;
  window.gtag('event', name, props ?? {});
}
