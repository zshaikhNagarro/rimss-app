import { afterEach, describe, expect, it } from 'vitest';
import { getConsent, initAnalytics, sendGaEvent, setConsent } from './analytics';

afterEach(() => {
  document.head.innerHTML = '';
});

describe('analytics', () => {
  it('is a no-op without a measurement id', () => {
    initAnalytics(undefined);
    expect(document.querySelector('script[src*="googletagmanager"]')).toBeNull();
    expect(() => sendGaEvent('x')).not.toThrow();
  });

  it('loads gtag once and forwards events to the data layer', () => {
    initAnalytics('G-TEST123');
    initAnalytics('G-TEST123');
    expect(document.querySelectorAll('script[src*="G-TEST123"]')).toHaveLength(1);

    const before = window.dataLayer!.length;
    sendGaEvent('add_to_cart', { productId: 'p1' });
    expect(window.dataLayer!.length).toBe(before + 1);
    const last = Array.from(window.dataLayer!.at(-1) as ArrayLike<unknown>);
    expect(last).toEqual(['event', 'add_to_cart', { productId: 'p1' }]);
  });

  it('persists the consent choice and stops sending when denied', () => {
    localStorage.clear();
    expect(getConsent()).toBeNull();
    setConsent('denied');
    expect(getConsent()).toBe('denied');

    const before = window.dataLayer!.length;
    sendGaEvent('after_denied');
    expect(window.dataLayer!.length).toBe(before);
  });
});
