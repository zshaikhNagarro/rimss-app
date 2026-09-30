import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const push = vi.hoisted(() => ({
  isPushSupported: vi.fn(),
  getExistingSubscription: vi.fn(),
  subscribeToPush: vi.fn(),
  unsubscribeFromPush: vi.fn(),
}));
vi.mock('../../services/pushService', () => push);

import { NotificationToggle } from './NotificationToggle';

beforeEach(() => {
  vi.resetAllMocks();
  push.isPushSupported.mockReturnValue(true);
  push.getExistingSubscription.mockResolvedValue(null);
  push.subscribeToPush.mockResolvedValue(undefined);
  push.unsubscribeFromPush.mockResolvedValue(undefined);
});

describe('NotificationToggle', () => {
  it('renders nothing when push is unsupported', () => {
    push.isPushSupported.mockReturnValue(false);
    const { container } = render(<NotificationToggle />);
    expect(container).toBeEmptyDOMElement();
  });

  it('subscribes when toggled on', async () => {
    render(<NotificationToggle />);
    fireEvent.click(screen.getByRole('button', { name: 'Enable notifications' }));
    await waitFor(() => expect(screen.getByText('Alerts: On')).toBeInTheDocument());
    expect(push.subscribeToPush).toHaveBeenCalled();
  });

  it('starts enabled when a subscription exists and unsubscribes on toggle', async () => {
    push.getExistingSubscription.mockResolvedValue({});
    render(<NotificationToggle />);
    await waitFor(() => expect(screen.getByText('Alerts: On')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(screen.getByText('Alerts: Off')).toBeInTheDocument());
    expect(push.unsubscribeFromPush).toHaveBeenCalled();
  });

  it('surfaces an error state when subscribing fails', async () => {
    push.subscribeToPush.mockRejectedValue(new Error('denied'));
    render(<NotificationToggle />);
    fireEvent.click(screen.getByRole('button'));
    await waitFor(() => expect(screen.getByText('Alerts: error')).toBeInTheDocument());
  });
});
