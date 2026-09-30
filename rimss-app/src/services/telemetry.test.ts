import { describe, expect, it, vi } from 'vitest';
import { setTelemetrySink, track } from './telemetry';

describe('telemetry', () => {
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
