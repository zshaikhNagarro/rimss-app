import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { makeProduct } from '../../test/fixtures';
import { ProductCard } from './ProductCard';

const renderCard = (overrides = {}) =>
  render(
    <MemoryRouter>
      <ProductCard product={makeProduct(overrides)} />
    </MemoryRouter>,
  );

describe('ProductCard', () => {
  it('links to the product detail page', () => {
    renderCard();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/product/p1');
  });

  it('shows the plain price when not discounted', () => {
    renderCard();
    expect(screen.getByText('$100.00')).toBeInTheDocument();
    expect(screen.queryByText('-20%')).toBeNull();
  });

  it('shows discounted and original price with a badge', () => {
    renderCard({ discountPercent: 20 });
    expect(screen.getByText('$80.00')).toBeInTheDocument();
    expect(screen.getByText('$100.00')).toBeInTheDocument();
    expect(screen.getByText('-20%')).toBeInTheDocument();
  });

  it('flags out-of-stock products', () => {
    renderCard({ inStock: false });
    expect(screen.getByText('Out of stock')).toBeInTheDocument();
  });

  it('falls back when the image fails to load', () => {
    renderCard();
    fireEvent.error(screen.getByAltText('Wool Sweater'));
    expect(screen.getByText('No image')).toBeInTheDocument();
  });
});
