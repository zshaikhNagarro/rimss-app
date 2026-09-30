import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeProduct } from '../../../test/fixtures';
import { CartProvider } from '../../cart/CartContext';

const svc = vi.hoisted(() => ({ getById: vi.fn() }));
vi.mock('../../../services/productService', () => ({ productService: svc }));

import { ProductShowcaseModule } from './ProductShowcaseModule';

const renderModule = () =>
  render(
    <MemoryRouter initialEntries={['/product/p1']}>
      <CartProvider>
        <Routes>
          <Route path="/product/:id" element={<ProductShowcaseModule />} />
        </Routes>
      </CartProvider>
    </MemoryRouter>,
  );

beforeEach(() => vi.resetAllMocks());

describe('ProductShowcaseModule', () => {
  it('shows a skeleton then product details', async () => {
    svc.getById.mockResolvedValue(makeProduct({ discountPercent: 25 }));
    renderModule();
    expect(screen.getByLabelText('Loading product')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Wool Sweater' })).toBeInTheDocument();
    expect(screen.getByText('$75.00')).toBeInTheDocument();
    expect(screen.getByText('In stock')).toBeInTheDocument();
  });

  it('adds to cart and confirms', async () => {
    svc.getById.mockResolvedValue(makeProduct());
    renderModule();
    fireEvent.click(await screen.findByRole('button', { name: 'Add to Cart' }));
    expect(screen.getByText('Added to cart!')).toBeInTheDocument();
  });

  it('disables add-to-cart when out of stock', async () => {
    svc.getById.mockResolvedValue(makeProduct({ inStock: false }));
    renderModule();
    expect(await screen.findByRole('button', { name: 'Add to Cart' })).toBeDisabled();
  });

  it('shows the error fallback and retries', async () => {
    svc.getById.mockRejectedValueOnce(new Error('404')).mockResolvedValue(makeProduct());
    renderModule();
    expect(await screen.findByRole('alert')).toHaveTextContent("Couldn't load this product");
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Wool Sweater' })).toBeInTheDocument(),
    );
  });
});
