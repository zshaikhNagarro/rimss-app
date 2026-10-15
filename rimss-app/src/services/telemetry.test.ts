import { describe, expect, it, vi } from 'vitest';
import { initTelemetry, setTelemetrySink, track, trackEvent } from './telemetry';

describe('initTelemetry', () => {
  it('beacons events with the route and captures uncaught errors', () => {
    const sendBeacon = vi.fn().mockReturnValue(true);
    const listeners: Record<string, (e: unknown) => void> = {};
    const target = {
      location: { pathname: '/product/p1' },
      navigator: { sendBeacon },
      addEventListener: (type: string, fn: (e: unknown) => void) => (listeners[type] = fn),
    } as unknown as Window;

    initTelemetry('https://t.example/in', target);
    listeners.error({ message: 'boom' });
    listeners.unhandledrejection({ reason: 'nope' });

    expect(sendBeacon).toHaveBeenCalledTimes(2);
    const [url, body] = sendBeacon.mock.calls[0];
    expect(url).toBe('https://t.example/in');
    expect(JSON.parse(body)).toMatchObject({ message: 'boom', route: '/product/p1' });
  });
});

describe('telemetry', () => {
  it('trackEvent emits an analytics event with its props', () => {
    const sink = vi.fn();
    setTelemetrySink(sink);
    trackEvent('add_to_cart', { productId: 'p1', quantity: 2 });
    expect(sink).toHaveBeenCalledWith({
      type: 'analytics',
      message: 'add_to_cart',
      context: { productId: 'p1', quantity: 2 },
    });
  });

  it('forwards events to the configured sink', () => {
    const sink = vi.fn();
    setTelemetrySink(sink);
    track({ type: 'error', message: 'x' });
    expect(sink).toHaveBeenCalledWith({ type: 'error', message: 'x' });
  });

  it('never throws when the sink fails', () => {
    setTelemetrySink(() => {
      throw new Error('sink down');
    });
    expect(() => track({ type: 'error', message: 'x' })).not.toThrow();
  });
});
