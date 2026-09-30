import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProductDetailSkeleton, ProductGridSkeleton } from './Skeleton';

describe('Skeleton', () => {
  it('renders the requested number of card placeholders', () => {
    const { container } = render(<ProductGridSkeleton count={4} />);
    expect(container.querySelectorAll('.skeleton-card')).toHaveLength(4);
  });

  it('marks the grid as busy for assistive tech', () => {
    render(<ProductGridSkeleton />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-busy', 'true');
  });

  it('renders the detail skeleton', () => {
    render(<ProductDetailSkeleton />);
    expect(screen.getByLabelText('Loading product')).toBeInTheDocument();
  });
});
