import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { makeProduct } from '../../test/fixtures';
import { ProductGrid } from './ProductGrid';

const renderGrid = (products = [makeProduct(), makeProduct({ id: 'p2', name: 'Denim Jacket' })]) =>
  render(
    <MemoryRouter>
      <ProductGrid products={products} className="custom" />
    </MemoryRouter>,
  );

describe('ProductGrid', () => {
  it('renders one card link per product', () => {
    renderGrid();
    const hrefs = screen.getAllByRole('link').map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(['/product/p1', '/product/p2']);
  });

  it('renders nothing but the container when empty', () => {
    const { container } = renderGrid([]);
    expect(screen.queryAllByRole('link')).toHaveLength(0);
    expect(container.querySelector('.custom')).toBeInTheDocument();
  });
});
