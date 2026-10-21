import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { setSession } from '../../services/session';
import { Footer } from './Footer';

describe('Footer', () => {
  it('shows branding, navigation links and the current-year copyright', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Shop' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Wishlist' })).toHaveAttribute('href', '/wishlist');
    expect(screen.queryByRole('link', { name: 'Account' })).toBeNull();
    expect(
      screen.getByText(`\u00a9 ${new Date().getFullYear()} YCompany. All rights reserved.`),
    ).toBeInTheDocument();
  });

  it('shows the Account link only when signed in', () => {
    setSession({ email: 'a@example.com' });
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: 'Account' })).toHaveAttribute('href', '/account');
    setSession(null);
  });
});
