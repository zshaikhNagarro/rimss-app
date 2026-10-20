import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpStatusError } from '../../services/httpClient';

const auth = vi.hoisted(() => ({ login: vi.fn(), register: vi.fn(), logout: vi.fn() }));
vi.mock('../../services/authService', () => ({ authService: auth }));

import { AuthDialog } from './AuthDialog';

beforeEach(() => vi.resetAllMocks());

const submit = () => {
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@example.com' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password1' } });
  fireEvent.submit(screen.getByRole('dialog'));
};

describe('AuthDialog', () => {
  it('renders nothing when closed', () => {
    render(<AuthDialog open={false} onClose={vi.fn()} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('is a modal dialog closed by Escape and the close button', () => {
    const onClose = vi.fn();
    render(<AuthDialog open onClose={onClose} />);
    expect(screen.getByRole('dialog', { name: 'Sign in' })).toHaveAttribute('aria-modal', 'true');
    fireEvent.keyDown(document, { key: 'Escape' });
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('signs in, then reports success and closes', async () => {
    auth.login.mockResolvedValue(undefined);
    const onClose = vi.fn();
    const onSuccess = vi.fn();
    render(<AuthDialog open onClose={onClose} onSuccess={onSuccess} />);
    submit();
    await waitFor(() => expect(auth.login).toHaveBeenCalledWith('a@example.com', 'password1'));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(onSuccess).toHaveBeenCalled();
  });

  it('switches to registration', () => {
    render(<AuthDialog open onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Need an account? Register' }));
    expect(screen.getByRole('dialog', { name: 'Create account' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument();
  });

  it.each([
    [401, 'Invalid email or password.'],
    [409, 'That email is already registered.'],
    [429, 'Too many attempts. Try again in a minute.'],
  ])('keeps the dialog open and maps a %i response', async (status, message) => {
    auth.login.mockRejectedValue(new HttpStatusError(status));
    const onClose = vi.fn();
    render(<AuthDialog open onClose={onClose} />);
    submit();
    expect(await screen.findByRole('alert')).toHaveTextContent(message);
    expect(onClose).not.toHaveBeenCalled();
  });
});
