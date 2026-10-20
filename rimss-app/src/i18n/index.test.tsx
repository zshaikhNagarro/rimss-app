import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { I18nProvider, useI18n } from './index';

function Probe() {
  const { t, lang, setLang } = useI18n();
  return (
    <>
      <span data-testid="text">{t('header.cart', { count: 2 })}</span>
      <span data-testid="lang">{lang}</span>
      <button onClick={() => setLang('es')}>es</button>
    </>
  );
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.lang = '';
});

describe('I18nProvider', () => {
  it('defaults to English without a provider', () => {
    render(<Probe />);
    expect(screen.getByTestId('text')).toHaveTextContent('Cart (2)');
  });

  it('switches language, persists it and sets <html lang>', () => {
    render(
      <I18nProvider>
        <Probe />
      </I18nProvider>,
    );
    fireEvent.click(screen.getByText('es'));
    expect(screen.getByTestId('text')).toHaveTextContent('Carrito (2)');
    expect(localStorage.getItem('rimss.lang')).toBe('es');
    expect(document.documentElement.lang).toBe('es');
  });

  it('restores a saved language', () => {
    localStorage.setItem('rimss.lang', 'es');
    render(
      <I18nProvider>
        <Probe />
      </I18nProvider>,
    );
    expect(screen.getByTestId('lang')).toHaveTextContent('es');
  });
});
