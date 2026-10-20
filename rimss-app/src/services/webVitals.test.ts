import { beforeEach, describe, expect, it, vi } from 'vitest';

const vitals = vi.hoisted(() => ({ handlers: {} as Record<string, (m: unknown) => void> }));
vi.mock('web-vitals', () => ({
  onLCP: (cb: (m: unknown) => void) => (vitals.handlers.LCP = cb),
  onINP: (cb: (m: unknown) => void) => (vitals.handlers.INP = cb),
  onCLS: (cb: (m: unknown) => void) => (vitals.handlers.CLS = cb),
}));
const trackEvent = vi.hoisted(() => vi.fn());
vi.mock('./telemetry', () => ({ trackEvent }));

import { reportWebVitals } from './webVitals';

beforeEach(() => trackEvent.mockClear());

describe('reportWebVitals', () => {
  it('forwards rounded metrics to telemetry', () => {
    reportWebVitals();
    vitals.handlers.LCP({ name: 'LCP', value: 1234.6, rating: 'good' });
    expect(trackEvent).toHaveBeenCalledWith('web_vital', {
      name: 'LCP',
      value: 1235,
      rating: 'good',
    });
  });

  it('scales CLS to thousandths so it survives rounding', () => {
    reportWebVitals();
    vitals.handlers.CLS({ name: 'CLS', value: 0.0456, rating: 'good' });
    expect(trackEvent).toHaveBeenCalledWith('web_vital', {
      name: 'CLS',
      value: 46,
      rating: 'good',
    });
  });
});
