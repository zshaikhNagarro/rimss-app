import { fireEvent, render as rtlRender, screen } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getSession, setSession } from '../../../services/session';

const auth = vi.hoisted(() => ({ login: vi.fn(), register: vi.fn(), logout: vi.fn() }));
vi.mock('../../../services/authService', () => ({ authService: auth }));
const orders = vi.hoisted(() => ({ listOrders: vi.fn(), pay: vi.fn(), cancel: vi.fn() }));
vi.mock('../../../services/orderService', () => ({ orderService: orders }));

import { AccountModule } from './AccountModule';

const render = (ui: ReactElement) => rtlRender(<MemoryRouter>{ui}</MemoryRouter>);

const order = (over = {}) => ({
  id: 'o1',
  status: 'PENDING_PAYMENT',
  subtotal: 100,
  discountTotal: 0,
  total: 100,
  createdAt: '2026-01-01T00:00:00.000Z',
  lines: [
    {
      productId: 'p1',
      name: 'Wool Sweater',
      quantity: 2,
      discountPercent: 0,
      unitPrice: 50,
      lineTotal: 100,
    },
  ],
  ...over,
});

beforeEach(() => {
  vi.resetAllMocks();
  orders.listOrders.mockResolvedValue([order()]);
});
afterEach(() => setSession(null));

describe('AccountModule signed out', () => {
  it('redirects to the shop instead of showing a form', () => {
    rtlRender(
      <MemoryRouter initialEntries={['/account']}>
        <Routes>
          <Route path="/" element={<p>shop</p>} />
          <Route path="/account" element={<AccountModule />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByText('shop')).toBeInTheDocument();
  });
});

describe('AccountModule signed in', () => {
  beforeEach(() => setSession({ email: 'a@example.com' }));

  it('lists orders with item count and actions for pending orders', async () => {
    render(<AccountModule />);
    expect(await screen.findByText('2 x Wool Sweater')).toBeInTheDocument();
    expect(screen.getByText(/1 item/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pay (demo)' })).toBeInTheDocument();
  });

  it('shows the empty state', async () => {
    orders.listOrders.mockResolvedValue([]);
    render(<AccountModule />);
    expect(await screen.findByText('You have not placed any orders yet.')).toBeInTheDocument();
  });

  it('pays an order and updates its status', async () => {
    orders.pay.mockResolvedValue(order({ status: 'PAID' }));
    render(<AccountModule />);
    fireEvent.click(await screen.findByRole('button', { name: 'Pay (demo)' }));
    expect(await screen.findByText('Paid')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Pay (demo)' })).toBeNull();
  });

  it('reports a failed action', async () => {
    orders.cancel.mockRejectedValue(new Error('nope'));
    render(<AccountModule />);
    fireEvent.click(await screen.findByRole('button', { name: 'Cancel' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('not available');
  });

  it('shows a fallback when orders cannot load', async () => {
    orders.listOrders.mockRejectedValue(new Error('401'));
    render(<AccountModule />);
    expect(await screen.findByRole('alert')).toHaveTextContent("Couldn't load your orders");
  });

  it('signs out through the auth service', async () => {
    render(<AccountModule />);
    fireEvent.click(await screen.findByRole('button', { name: 'Sign out' }));
    expect(auth.logout).toHaveBeenCalled();
    expect(getSession()).not.toBeNull();
  });
});
