import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import type { ModulePlugin } from '../../plugins/PluginRegistry';
import { CartProvider, useCart } from '../../modules/cart/CartContext';
import { makeProduct } from '../../test/fixtures';
import { Header } from './Header';

vi.mock('../NotificationToggle', () => ({ NotificationToggle: () => null }));

const Stub = () => null;
const modules: ModulePlugin[] = [
  { id: 'a', navLabel: 'Shop', route: '/', component: Stub },
  { id: 'b', navLabel: 'Detail', route: '/product/:id', hideFromNav: true, component: Stub },
];

function AddItem() {
  const { addProduct } = useCart();
  return <button onClick={() => addProduct(makeProduct(), 2)}>add</button>;
}

const renderHeader = (onCartClick = vi.fn()) => {
  render(
    <MemoryRouter>
      <CartProvider>
        <Header modules={modules} onCartClick={onCartClick} />
        <AddItem />
      </CartProvider>
    </MemoryRouter>,
  );
  return onCartClick;
};

describe('Header', () => {
  it('lists only nav-visible modules', () => {
    renderHeader();
    expect(screen.getByRole('link', { name: 'Shop' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Detail' })).toBeNull();
  });

  it('shows the cart item count', () => {
    renderHeader();
    expect(screen.getByRole('button', { name: 'Open cart' })).toHaveTextContent('Cart (0)');
    fireEvent.click(screen.getByText('add'));
    expect(screen.getByRole('button', { name: 'Open cart' })).toHaveTextContent('Cart (2)');
  });

  it('invokes onCartClick', () => {
    const onCartClick = renderHeader();
    fireEvent.click(screen.getByRole('button', { name: 'Open cart' }));
    expect(onCartClick).toHaveBeenCalled();
  });
});
