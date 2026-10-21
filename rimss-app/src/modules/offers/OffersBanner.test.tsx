import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeProduct } from '../../test/fixtures';

const svc = vi.hoisted(() => ({ searchPage: vi.fn() }));
vi.mock('../../services/productService', () => ({ productService: svc }));

import { OffersBanner } from './OffersBanner';

const items = [
  makeProduct({ id: 'a', name: 'Red Hat', discountPercent: 20 }),
  makeProduct({ id: 'b', name: 'Blue Coat', discountPercent: 30 }),
];

const renderBanner = () =>
  render(
    <MemoryRouter>
      <OffersBanner />
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.resetAllMocks();
  localStorage.clear();
  svc.searchPage.mockResolvedValue({ items, total: 2 });
});

describe('OffersBanner', () => {
  it('shows an offer and cycles to the next one', async () => {
    renderBanner();
    expect(await screen.findByText(/Red Hat: 20% off/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Next offer' }));
    expect(screen.getByText(/Blue Coat: 30% off/)).toBeInTheDocument();
  });

  it('can be hidden and shown again, remembering the choice', async () => {
    renderBanner();
    await screen.findByText(/Red Hat/);
    fireEvent.click(screen.getByRole('button', { name: 'Hide' }));
    expect(screen.queryByText(/Red Hat/)).not.toBeInTheDocument();
    expect(localStorage.getItem('rimss.offers.hidden')).toBe('1');
    fireEvent.click(screen.getByRole('button', { name: 'Show latest offers' }));
    expect(screen.getByText(/Red Hat/)).toBeInTheDocument();
  });

  it('renders nothing when there are no discounted products', async () => {
    svc.searchPage.mockResolvedValue({ items: [], total: 0 });
    const { container } = renderBanner();
    await Promise.resolve();
    expect(container).toBeEmptyDOMElement();
  });
});
