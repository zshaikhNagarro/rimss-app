import { describe, expect, it } from 'vitest';
import { en, es } from './messages';
import { translate } from './index';

describe('translate', () => {
  it('interpolates params and falls back to English, then the key', () => {
    expect(translate('es', 'header.cart', { count: 3 })).toBe('Carrito (3)');
    expect(translate('en', 'search.maxPrice', { price: 40 })).toBe('Max price: $40');
    expect(translate('es', 'missing.key')).toBe('missing.key');
    expect(translate('es', 'nav.unknown', undefined, 'Fallback')).toBe('Fallback');
  });

  it('has a Spanish string for every English key', () => {
    expect(Object.keys(es).sort()).toEqual(Object.keys(en).sort());
  });
});
