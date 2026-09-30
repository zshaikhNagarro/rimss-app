import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Loader } from './Loader';

describe('Loader', () => {
  it('shows the default label', () => {
    render(<Loader />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading...');
  });

  it('shows a custom label', () => {
    render(<Loader label="Fetching" />);
    expect(screen.getByText('Fetching')).toBeInTheDocument();
  });
});
