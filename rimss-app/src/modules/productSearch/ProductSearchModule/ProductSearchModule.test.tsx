import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeProduct } from '../../../test/fixtures';

const svc = vi.hoisted(() => ({
  searchPage: vi.fn(),
  getCategories: vi.fn(),
  getColors: vi.fn(),
  getById: vi.fn(),
}));
vi.mock('../../../services/productService', () => ({ productService: svc }));

import { filterProducts, sortByPrice } from '../filterProducts';
import { ProductSearchModule } from './ProductSearchModule';

const products = [
  makeProduct({ id: '1', name: 'Red Hat', price: 30, category: 'Hats' }),
  makeProduct({ id: '2', name: 'Blue Coat', price: 200, category: 'Coats' }),
];

// Stands in for the API: filters, sorts and slices like GET /products does.
const fakeApi =
  (catalog: typeof products) =>
  async (filters: object, sort: 'asc' | 'desc', offset: number, limit: number) => {
    const all = sortByPrice(filterProducts(catalog, filters), sort);
    return { items: all.slice(offset, offset + limit), total: all.length };
  };

const renderModule = (initialEntry = '/') =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <ProductSearchModule />
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.resetAllMocks();
  svc.searchPage.mockImplementation(fakeApi(products));
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
    svc.searchPage.mockRejectedValueOnce(new Error('down'));
    renderModule();
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load products');
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    await waitFor(() => expect(screen.getByText('Red Hat')).toBeInTheDocument());
  });

  it('asks the API for the first page and appends the next on Show more', async () => {
    const many = Array.from({ length: 15 }, (_, i) =>
      makeProduct({ id: `m${i}`, name: `Item ${i}`, price: 10 + i }),
    );
    svc.searchPage.mockImplementation(fakeApi(many));
    renderModule();
    await screen.findByText('Item 0');
    expect(svc.searchPage).toHaveBeenCalledWith({}, 'asc', 0, 12);
    expect(screen.queryByText('Item 12')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /show more/i }));
    expect(await screen.findByText('Item 14')).toBeInTheDocument();
    expect(svc.searchPage).toHaveBeenCalledWith({}, 'asc', 12, 12);
    expect(screen.queryByRole('button', { name: /show more/i })).toBeNull();
  });
});
