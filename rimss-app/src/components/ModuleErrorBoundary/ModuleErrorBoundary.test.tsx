import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setTelemetrySink } from '../../services/telemetry';
import { ModuleErrorBoundary } from './ModuleErrorBoundary';

let shouldThrow = true;
function Bomb() {
  if (shouldThrow) throw new Error('boom');
  return <p>recovered</p>;
}

const sink = vi.fn();

beforeEach(() => {
  shouldThrow = true;
  setTelemetrySink(sink);
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

describe('ModuleErrorBoundary', () => {
  it('renders children when healthy', () => {
    shouldThrow = false;
    render(
      <ModuleErrorBoundary label="Shop">
        <Bomb />
      </ModuleErrorBoundary>,
    );
    expect(screen.getByText('recovered')).toBeInTheDocument();
  });

  it('shows the fallback and reports telemetry on crash', () => {
    render(
      <ModuleErrorBoundary label="Shop">
        <Bomb />
      </ModuleErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Shop is temporarily unavailable');
    expect(sink).toHaveBeenCalledWith(expect.objectContaining({ type: 'error', message: 'boom' }));
  });

  it('recovers after retry once the child stops throwing', () => {
    render(
      <ModuleErrorBoundary label="Shop">
        <Bomb />
      </ModuleErrorBoundary>,
    );
    shouldThrow = false;
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(screen.getByText('recovered')).toBeInTheDocument();
  });
});
