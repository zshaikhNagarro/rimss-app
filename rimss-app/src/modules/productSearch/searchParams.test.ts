import { describe, expect, it } from 'vitest';
import { parseSearchParams, toSearchParams } from './searchParams';

describe('searchParams', () => {
  it('parses every supported parameter', () => {
    const state = parseSearchParams(
      new URLSearchParams('q=hat&category=Hats&color=Red&maxPrice=0&discountedOnly=true&sort=desc'),
    );
    expect(state).toEqual({
      filters: { q: 'hat', category: 'Hats', color: 'Red', maxPrice: 0, discountedOnly: true },
      sort: 'desc',
    });
  });

  it('applies defaults and ignores invalid values', () => {
    expect(parseSearchParams(new URLSearchParams('maxPrice=abc&sort=up&discountedOnly=1'))).toEqual(
      { filters: {}, sort: 'asc' },
    );
  });

  it('round-trips state and omits defaults', () => {
    const state = { filters: { q: 'a b', maxPrice: 50 }, sort: 'asc' as const };
    const params = toSearchParams(state);
    expect(params.toString()).toBe('q=a+b&maxPrice=50');
    expect(parseSearchParams(params)).toEqual(state);
  });
});
