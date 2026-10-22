import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { setSession } from '../../services/session';
import { Footer } from './Footer';

describe('Footer', () => {
  it('shows branding and the current-year copyright without Shop or Wishlist links', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Shop' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Wishlist' })).toBeNull();
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
