import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const sw = vi.hoisted(() => ({
  offlineReady: false,
  needRefresh: false,
  setOfflineReady: vi.fn(),
  setNeedRefresh: vi.fn(),
  updateServiceWorker: vi.fn(),
}));

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({
    offlineReady: [sw.offlineReady, sw.setOfflineReady],
    needRefresh: [sw.needRefresh, sw.setNeedRefresh],
    updateServiceWorker: sw.updateServiceWorker,
  }),
}));

import { UpdatePrompt } from './UpdatePrompt';

beforeEach(() => {
  sw.offlineReady = false;
  sw.needRefresh = false;
  vi.clearAllMocks();
});

describe('UpdatePrompt', () => {
  it('renders nothing by default', () => {
    const { container } = render(<UpdatePrompt />);
    expect(container).toBeEmptyDOMElement();
  });

  it('announces offline readiness', () => {
    sw.offlineReady = true;
    render(<UpdatePrompt />);
    expect(screen.getByRole('status')).toHaveTextContent('ready to work offline');
  });

  it('offers a reload when an update is available', () => {
    sw.needRefresh = true;
    render(<UpdatePrompt />);
    fireEvent.click(screen.getByRole('button', { name: 'Reload' }));
    expect(sw.updateServiceWorker).toHaveBeenCalledWith(true);
  });

  it('dismisses both flags', () => {
    sw.needRefresh = true;
    render(<UpdatePrompt />);
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(sw.setOfflineReady).toHaveBeenCalledWith(false);
    expect(sw.setNeedRefresh).toHaveBeenCalledWith(false);
  });
});
