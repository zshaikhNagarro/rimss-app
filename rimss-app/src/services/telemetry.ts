export interface TelemetryEvent {
  type: 'error' | 'http_retry';
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
