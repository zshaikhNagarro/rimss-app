import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { makeProduct } from '../../../test/fixtures';
import { CartProvider, useCart } from '../CartContext';
import { CartDrawer } from './CartDrawer';

function Seed() {
  const { addProduct } = useCart();
  return <button onClick={() => addProduct(makeProduct(), 1)}>seed</button>;
}

const renderDrawer = (open = true, onClose = vi.fn()) => {
  render(
    <CartProvider>
      <Seed />
      <CartDrawer open={open} onClose={onClose} />
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
});
