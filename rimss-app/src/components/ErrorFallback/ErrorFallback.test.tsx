import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ErrorFallback } from './ErrorFallback';

describe('ErrorFallback', () => {
  it('renders default title and message as an alert', () => {
    render(<ErrorFallback />);
    expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong');
    expect(screen.getByText('Please try again.')).toBeInTheDocument();
  });

  it('hides the retry button without a handler', () => {
    render(<ErrorFallback />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('calls onRetry when the button is clicked', () => {
    const onRetry = vi.fn();
    render(<ErrorFallback onRetry={onRetry} actionLabel="Retry" />);
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
