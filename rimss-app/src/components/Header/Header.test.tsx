import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import type { ModulePlugin } from '../../plugins/PluginRegistry';
import { CartProvider, useCart } from '../../modules/cart/CartContext';
import { makeProduct } from '../../test/fixtures';
import { Header } from './Header';
import { setSession } from '../../services/session';

vi.mock('../NotificationToggle', () => ({ NotificationToggle: () => null }));

const Stub = () => null;
const modules: ModulePlugin[] = [
  { id: 'a', navLabel: 'Shop', route: '/', component: Stub },
  { id: 'b', navLabel: 'Detail', route: '/product/:id', hideFromNav: true, component: Stub },
  { id: 'c', navLabel: 'Account', route: '/account', requiresAuth: true, component: Stub },
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

  it('shows auth-only modules and no sign-in button once signed in', () => {
    setSession({ token: 't', email: 'a@example.com' });
    renderHeader();
    expect(screen.getByRole('link', { name: 'Account' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Sign in' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(screen.queryByRole('link', { name: 'Account' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
    setSession(null);
  });

  it('hides auth-only modules and offers sign-in when signed out', () => {
    const onSignInClick = vi.fn();
    render(
      <MemoryRouter>
        <CartProvider>
          <Header modules={modules} onCartClick={vi.fn()} onSignInClick={onSignInClick} />
        </CartProvider>
      </MemoryRouter>,
    );
    expect(screen.queryByRole('link', { name: 'Account' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(onSignInClick).toHaveBeenCalled();
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
