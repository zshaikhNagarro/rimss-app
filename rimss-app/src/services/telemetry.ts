export interface TelemetryEvent {
  type: 'error' | 'http_retry' | 'analytics';
  message: string;
  context?: Record<string, unknown>;
}

type Sink = (event: TelemetryEvent) => void;

let sink: Sink = (event) => console.warn('[telemetry]', event);

/** Swap in a real backend (Sentry, App Insights, ...) without touching call sites. */
export function setTelemetrySink(next: Sink): void {
  sink = next;
}

export function track(event: TelemetryEvent): void {
  try {
    sink(event);
  } catch {
    // Telemetry must never break the app.
  }
}

/** Product analytics event (page_view, add_to_cart, checkout, ...). */
export function trackEvent(name: string, props?: Record<string, unknown>): void {
  track({ type: 'analytics', message: name, context: props });
}

/** Ships events to `endpoint` (when set) and captures uncaught errors. Call once at startup. */
export function initTelemetry(endpoint?: string, target: Window = window): void {
  if (endpoint) {
    setTelemetrySink((event) => {
      const body = JSON.stringify({ ...event, route: target.location.pathname, ts: Date.now() });
      if (!target.navigator.sendBeacon?.(endpoint, body)) {
        void fetch(endpoint, { method: 'POST', body, keepalive: true }).catch(() => {});
      }
    });
  }
  target.addEventListener('error', (e) => track({ type: 'error', message: e.message }));
  target.addEventListener('unhandledrejection', (e) =>
    track({ type: 'error', message: String(e.reason) }),
  );
}
