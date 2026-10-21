import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { I18nProvider } from '../../i18n';
import { LanguageMenu } from './LanguageMenu';

const renderMenu = () =>
  render(
    <I18nProvider>
      <LanguageMenu />
    </I18nProvider>,
  );

beforeEach(() => localStorage.clear());

describe('LanguageMenu', () => {
  it('opens a menu with the current language checked', () => {
    renderMenu();
    expect(screen.queryByRole('menu')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Language' }));
    expect(screen.getByRole('menuitemradio', { name: 'English' })).toBeChecked();
    expect(screen.getByRole('menuitemradio', { name: 'Español' })).not.toBeChecked();
  });

  it('switches language and closes', () => {
    renderMenu();
    fireEvent.click(screen.getByRole('button', { name: 'Language' }));
    fireEvent.click(screen.getByRole('menuitemradio', { name: 'Español' }));
    expect(screen.queryByRole('menu')).toBeNull();
    expect(screen.getByRole('button', { name: 'Idioma' })).toHaveTextContent('Español');
  });

  it('is operable by keyboard: focus, arrows, Escape returns to the trigger', () => {
    renderMenu();
    const trigger = screen.getByRole('button', { name: 'Language' });
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    const english = screen.getByRole('menuitemradio', { name: 'English' });
    const spanish = screen.getByRole('menuitemradio', { name: 'Español' });
    expect(english).toHaveFocus();
    fireEvent.keyDown(english, { key: 'ArrowDown' });
    expect(spanish).toHaveFocus();
    fireEvent.keyDown(spanish, { key: 'Escape' });
    expect(screen.queryByRole('menu')).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it('closes on Escape and on outside click', () => {
    renderMenu();
    const trigger = screen.getByRole('button', { name: 'Language' });
    fireEvent.click(trigger);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).toBeNull();
    fireEvent.click(trigger);
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole('menu')).toBeNull();
  });
});
