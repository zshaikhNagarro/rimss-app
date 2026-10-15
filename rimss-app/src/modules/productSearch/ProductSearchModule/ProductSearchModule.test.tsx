import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeProduct } from '../../../test/fixtures';

const svc = vi.hoisted(() => ({
  search: vi.fn(),
  getCategories: vi.fn(),
  getColors: vi.fn(),
  getById: vi.fn(),
}));
vi.mock('../../../services/productService', () => ({ productService: svc }));

import { ProductSearchModule } from './ProductSearchModule';

const products = [
  makeProduct({ id: '1', name: 'Red Hat', price: 30, category: 'Hats' }),
  makeProduct({ id: '2', name: 'Blue Coat', price: 200, category: 'Coats' }),
];

const renderModule = (initialEntry = '/') =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <ProductSearchModule />
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.resetAllMocks();
  svc.search.mockResolvedValue(products);
  svc.getCategories.mockResolvedValue(['Hats', 'Coats']);
  svc.getColors.mockResolvedValue(['Red', 'Blue']);
});

describe('ProductSearchModule', () => {
  it('shows a skeleton then the products', async () => {
    renderModule();
    expect(screen.getByLabelText('Loading products')).toBeInTheDocument();
    expect(await screen.findByText('Red Hat')).toBeInTheDocument();
    expect(screen.getByText('Blue Coat')).toBeInTheDocument();
  });

  it('filters by name', async () => {
    renderModule();
    await screen.findByText('Red Hat');
    fireEvent.change(screen.getByPlaceholderText('e.g. sweater'), { target: { value: 'coat' } });
    await waitFor(() => expect(screen.queryByText('Red Hat')).toBeNull());
    expect(screen.getByText('Blue Coat')).toBeInTheDocument();
  });

  it('initialises filters from the URL and announces the result count', async () => {
    renderModule('/?category=Coats&sort=desc');
    await screen.findByText('Blue Coat');
    expect(screen.queryByText('Red Hat')).toBeNull();
    expect(screen.getByLabelText('Category')).toHaveValue('Coats');
    expect(screen.getByRole('status')).toHaveTextContent('1 products found');
  });

  it('clears filters', async () => {
    renderModule('/?q=coat');
    await screen.findByText('Blue Coat');
    expect(screen.queryByText('Red Hat')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(await screen.findByText('Red Hat')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. sweater')).toHaveValue('');
  });

  it('shows an empty state when nothing matches', async () => {
    renderModule();
    await screen.findByText('Red Hat');
    fireEvent.change(screen.getByPlaceholderText('e.g. sweater'), { target: { value: 'zzz' } });
    expect(await screen.findByText('No products match the selected filters.')).toBeInTheDocument();
  });

  it('shows the error fallback and retries', async () => {
    svc.search.mockRejectedValueOnce(new Error('down'));
    renderModule();
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load products');
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    await waitFor(() => expect(screen.getByText('Red Hat')).toBeInTheDocument());
  });
});
