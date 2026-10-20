import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeProduct } from '../../test/fixtures';

const svc = vi.hoisted(() => ({ search: vi.fn() }));
vi.mock('../../services/productService', () => ({ productService: svc }));

import { WishlistModule } from './WishlistModule';
import { wishlist } from './wishlistStore';

const products = [
  makeProduct({ id: 'a', name: 'Red Hat' }),
  makeProduct({ id: 'b', name: 'Blue Coat' }),
];

const renderModule = () =>
  render(
    <MemoryRouter>
      <WishlistModule />
    </MemoryRouter>,
  );

beforeEach(() => {
  vi.resetAllMocks();
  svc.search.mockResolvedValue(products);
  localStorage.clear();
  ['a', 'b'].forEach((id) => {
    if (wishlist.getSnapshot().includes(id)) wishlist.toggle(id);
  });
});

describe('WishlistModule', () => {
  it('shows an empty state with a link to the shop', async () => {
    renderModule();
    expect(await screen.findByText(/Nothing saved yet/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Browse the shop' })).toHaveAttribute('href', '/');
  });

  it('lists only saved products', async () => {
    wishlist.toggle('b');
    renderModule();
    expect(await screen.findByText('Blue Coat')).toBeInTheDocument();
    expect(screen.queryByText('Red Hat')).toBeNull();
  });

  it('shows an error fallback with retry when loading fails', async () => {
    svc.search.mockRejectedValueOnce(new Error('boom'));
    renderModule();
    expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load your wishlist');
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });
});
