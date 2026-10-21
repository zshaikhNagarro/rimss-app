import { describe, expect, it } from 'vitest';
import { apiErrorMessage } from './errors';
import { translate } from './index';

const tIn =
  (lang: 'en' | 'es') => (key: string, params?: Record<string, string | number>, fb?: string) =>
    translate(lang, key, params, fb);

describe('apiErrorMessage', () => {
  it('translates known API error codes', () => {
    expect(apiErrorMessage({ code: 'OUT_OF_STOCK' }, tIn('en'))).toMatch(/out of stock/);
    expect(apiErrorMessage({ code: 'OUT_OF_STOCK' }, tIn('es'))).toMatch(/agotado/);
  });

  it('returns undefined for unknown or missing codes', () => {
    expect(apiErrorMessage({ code: 'SOMETHING_NEW' }, tIn('en'))).toBeUndefined();
    expect(apiErrorMessage(new Error('x'), tIn('en'))).toBeUndefined();
    expect(apiErrorMessage(null, tIn('en'))).toBeUndefined();
  });
});
