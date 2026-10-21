import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const analytics = vi.hoisted(() => ({
  GA_ID: 'G-TEST' as string | undefined,
  consent: null as string | null,
  setConsent: vi.fn(),
}));

vi.mock('../../services/analytics', () => ({
  get GA_ID() {
    return analytics.GA_ID;
  },
  getConsent: () => analytics.consent,
  setConsent: analytics.setConsent,
}));

import { ConsentBanner } from './ConsentBanner';

beforeEach(() => {
  analytics.GA_ID = 'G-TEST';
  analytics.consent = null;
  vi.clearAllMocks();
});

describe('ConsentBanner', () => {
  it('renders nothing when GA is not configured', () => {
    analytics.GA_ID = undefined;
    const { container } = render(<ConsentBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing once a choice was made', () => {
    analytics.consent = 'denied';
    const { container } = render(<ConsentBanner />);
    expect(container).toBeEmptyDOMElement();
  });

  it('stores acceptance and hides', () => {
    const { container } = render(<ConsentBanner />);
    fireEvent.click(screen.getByRole('button', { name: /accept/i }));
    expect(analytics.setConsent).toHaveBeenCalledWith('granted');
    expect(container).toBeEmptyDOMElement();
  });

  it('stores refusal and hides', () => {
    const { container } = render(<ConsentBanner />);
    fireEvent.click(screen.getByRole('button', { name: /decline/i }));
    expect(analytics.setConsent).toHaveBeenCalledWith('denied');
    expect(container).toBeEmptyDOMElement();
  });
});
