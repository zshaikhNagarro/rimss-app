declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let enabled = false;

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
