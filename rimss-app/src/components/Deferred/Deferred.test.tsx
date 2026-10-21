import { lazy } from 'react';
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setTelemetrySink } from '../../services/telemetry';
import { Deferred } from './Deferred';

beforeEach(() => {
  setTelemetrySink(vi.fn());
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

describe('Deferred', () => {
  it('renders the lazy child once its chunk loads', async () => {
    const Ready = lazy(() => Promise.resolve({ default: () => <p>loaded</p> }));
    render(
      <Deferred label="Widget">
        <Ready />
      </Deferred>,
    );
    expect(await screen.findByText('loaded')).toBeInTheDocument();
  });

  it('shows nothing while the chunk is pending', () => {
    const Pending = lazy(() => new Promise<never>(() => {}));
    const { container } = render(
      <Deferred label="Widget">
        <Pending />
      </Deferred>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('isolates a failed chunk behind the error fallback', async () => {
    const Broken = lazy(() => Promise.reject(new Error('chunk failed')));
    render(
      <Deferred label="Widget">
        <Broken />
      </Deferred>,
    );
    expect(await screen.findByRole('alert')).toHaveTextContent('Widget is temporarily unavailable');
  });
});
