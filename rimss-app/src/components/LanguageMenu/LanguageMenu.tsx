import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { LANGUAGES, useI18n, type Lang } from '../../i18n';
import { trackEvent } from '../../services/telemetry';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import { Button } from '../ui';
import './LanguageMenu.scss';

/** Themed language picker: an outline button that opens an animated menu. */
export function LanguageMenu() {
  const { t, lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEscapeKey(() => setOpen(false), open);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const items = rootRef.current?.querySelectorAll<HTMLElement>('[role="menuitemradio"]');
    const current = rootRef.current?.querySelector<HTMLElement>('[aria-checked="true"]');
    (current ?? items?.[0])?.focus();
  }, [open]);

  const closeToTrigger = () => {
    setOpen(false);
    rootRef.current?.querySelector<HTMLElement>('[aria-haspopup]')?.focus();
  };

  const onMenuKeyDown = (e: KeyboardEvent) => {
    const items = [
      ...(rootRef.current?.querySelectorAll<HTMLElement>('[role="menuitemradio"]') ?? []),
    ];
    const i = items.indexOf(document.activeElement as HTMLElement);
    const moves: Record<string, number> = {
      ArrowDown: (i + 1) % items.length,
      ArrowUp: (i - 1 + items.length) % items.length,
      Home: 0,
      End: items.length - 1,
    };
    if (e.key in moves) {
      e.preventDefault();
      items[moves[e.key]]?.focus();
    } else if (e.key === 'Escape') {
      e.stopPropagation();
      closeToTrigger();
    } else if (e.key === 'Tab') {
      setOpen(false);
    }
  };

  const choose = (code: Lang) => {
    trackEvent('change_language', { lang: code });
    setLang(code);
    closeToTrigger();
  };

  return (
    <div className="language-menu" ref={rootRef}>
      <Button
        variant="outline"
        aria-label={t('header.language')}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setOpen(true);
          }
        }}
      >
        {LANGUAGES[lang]}{' '}
        <span
          className={`language-menu__chevron${open ? ' language-menu__chevron--open' : ''}`}
          aria-hidden="true"
        >
          &#9662;
        </span>
      </Button>
      {open && (
        <div
          className="language-menu__list"
          role="menu"
          aria-label={t('header.language')}
          onKeyDown={onMenuKeyDown}
        >
          {(Object.entries(LANGUAGES) as [Lang, string][]).map(([code, name]) => (
            <Button
              key={code}
              variant="secondary"
              size="sm"
              role="menuitemradio"
              aria-checked={code === lang}
              className="language-menu__item"
              onClick={() => choose(code)}
            >
              {name}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
