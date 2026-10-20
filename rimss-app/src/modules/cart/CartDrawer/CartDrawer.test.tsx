import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeProduct } from '../../../test/fixtures';
import { setSession } from '../../../services/session';
import { setTelemetrySink } from '../../../services/telemetry';
import { CartProvider, useCart } from '../CartContext';

const orders = vi.hoisted(() => ({ createOrder: vi.fn(), pay: vi.fn() }));
vi.mock('../../../services/orderService', () => ({ orderService: orders }));

import { CartDrawer } from './CartDrawer';

beforeEach(() => {
  vi.resetAllMocks();
  setSession({ token: 't', email: 'a@example.com' });
});

function Seed() {
  const { addProduct } = useCart();
  return <button onClick={() => addProduct(makeProduct(), 1)}>seed</button>;
}

const renderDrawer = (open = true, onClose = vi.fn(), onSignIn = vi.fn()) => {
  render(
    <CartProvider>
      <Seed />
      <CartDrawer open={open} onClose={onClose} onSignIn={onSignIn} />
    </CartProvider>,
  );
  return onClose;
};

describe('CartDrawer', () => {
  it('renders nothing when closed', () => {
    renderDrawer(false);
    expect(screen.queryByText('Shopping Cart')).toBeNull();
  });

  it('shows the empty state and disables checkout', () => {
    renderDrawer();
    expect(screen.getByText('Your cart is empty.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Proceed to Payment/ })).toBeDisabled();
  });

  it('lists items with totals and allows removal', () => {
    renderDrawer();
    fireEvent.click(screen.getByText('seed'));
    expect(screen.getByText('Wool Sweater')).toBeInTheDocument();
    expect(screen.getByText('Total: $100.00')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Remove' }));
    expect(screen.getByText('Your cart is empty.')).toBeInTheDocument();
  });

  it('updates quantity', () => {
    renderDrawer();
    fireEvent.click(screen.getByText('seed'));
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '3' } });
    expect(screen.getByText('Total: $300.00')).toBeInTheDocument();
  });

  it('closes via the close button', () => {
    const onClose = renderDrawer();
    fireEvent.click(screen.getByRole('button', { name: 'Close cart' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('is an accessible modal dialog that closes on Escape', () => {
    const onClose = renderDrawer();
    expect(screen.getByRole('dialog', { name: 'Shopping Cart' })).toHaveAttribute(
      'aria-modal',
      'true',
    );
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('keeps Tab focus inside the dialog', () => {
    renderDrawer();
    fireEvent.click(screen.getByText('seed'));
    const close = screen.getByRole('button', { name: 'Close cart' });
    const checkout = screen.getByRole('button', { name: /Proceed to Payment/ });

    checkout.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(close).toHaveFocus();

    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(checkout).toHaveFocus();
  });

  it('places an order, clears the cart and confirms', async () => {
    const sink = vi.fn();
    setTelemetrySink(sink);
    orders.createOrder.mockResolvedValue({ id: 'ord-1', total: 100 });
    renderDrawer();
    fireEvent.click(screen.getByText('seed'));
    fireEvent.click(screen.getByRole('button', { name: /Proceed to Payment/ }));
    expect(await screen.findByRole('status')).toHaveTextContent('Order ord-1 placed');
    expect(sink).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'analytics', message: 'add_to_cart' }),
    );
    expect(sink).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'analytics', message: 'checkout_success' }),
    );
    expect(orders.createOrder).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Wool Sweater')).toBeNull();
  });

  it('asks signed-out users to sign in instead of placing the order', () => {
    setSession(null);
    const onSignIn = vi.fn();
    renderDrawer(true, vi.fn(), onSignIn);
    fireEvent.click(screen.getByText('seed'));
    expect(screen.getByText(/Sign in to place your order/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Sign in to checkout' }));
    expect(onSignIn).toHaveBeenCalledTimes(1);
    expect(orders.createOrder).not.toHaveBeenCalled();
    expect(screen.getByText('Wool Sweater')).toBeInTheDocument();
  });

  it('pays for a placed order through the demo gateway', async () => {
    orders.createOrder.mockResolvedValue({ id: 'ord-1', total: 100, status: 'PENDING_PAYMENT' });
    orders.pay.mockResolvedValue({ id: 'ord-1', total: 100, status: 'PAID' });
    renderDrawer();
    fireEvent.click(screen.getByText('seed'));
    fireEvent.click(screen.getByRole('button', { name: /Proceed to Payment/ }));
    fireEvent.click(await screen.findByRole('button', { name: /Pay \$100\.00/ }));
    expect(await screen.findByText(/Payment successful/)).toBeInTheDocument();
    expect(orders.pay).toHaveBeenCalledWith('ord-1');
    expect(screen.queryByRole('button', { name: /Pay \$/ })).toBeNull();
  });

  it('shows an error when payment fails and allows retry', async () => {
    orders.createOrder.mockResolvedValue({ id: 'ord-1', total: 100, status: 'PENDING_PAYMENT' });
    orders.pay.mockRejectedValue(new Error('x'));
    renderDrawer();
    fireEvent.click(screen.getByText('seed'));
    fireEvent.click(screen.getByRole('button', { name: /Proceed to Payment/ }));
    fireEvent.click(await screen.findByRole('button', { name: /Pay \$100\.00/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Payment failed');
    expect(screen.getByRole('button', { name: /Pay \$100\.00/ })).toBeEnabled();
  });

  it('keeps the cart and shows an error when the order fails', async () => {
    orders.createOrder.mockRejectedValue(new Error('503'));
    renderDrawer();
    fireEvent.click(screen.getByText('seed'));
    fireEvent.click(screen.getByRole('button', { name: /Proceed to Payment/ }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByText('Wool Sweater')).toBeInTheDocument();
  });

  it('restores the cart from storage', () => {
    renderDrawer();
    fireEvent.click(screen.getByText('seed'));
    cleanup();
    renderDrawer();
    expect(screen.getByText('Wool Sweater')).toBeInTheDocument();
  });
});
