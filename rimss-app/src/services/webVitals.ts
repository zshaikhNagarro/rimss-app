import { onCLS, onINP, onLCP, type Metric } from 'web-vitals';
import { trackEvent } from './telemetry';

/** Reports Core Web Vitals through the telemetry sink. */
export function reportWebVitals(): void {
  const send = ({ name, value, rating }: Metric) =>
    trackEvent('web_vital', {
      name,
      value: Math.round(name === 'CLS' ? value * 1000 : value),
      rating,
    });
  onLCP(send);
  onINP(send);
  onCLS(send);
}
