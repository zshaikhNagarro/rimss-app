import { describe, expect, it } from 'vitest';
import { formatPrice, getDiscountedPrice } from './price';

describe('price utils', () => {
  it('applies a percentage discount', () => {
    expect(getDiscountedPrice(100, 25)).toBe(75);
    expect(getDiscountedPrice(100, 0)).toBe(100);
  });

  it('formats to two decimals with a currency symbol', () => {
    expect(formatPrice(75)).toBe('$75.00');
    expect(formatPrice(9.5)).toBe('$9.50');
  });
});
