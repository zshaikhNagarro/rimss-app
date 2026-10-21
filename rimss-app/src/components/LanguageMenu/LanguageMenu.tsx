import { useEffect, useRef, useState } from 'react';
import { LANGUAGES, useI18n, type Lang } from '../../i18n';
import { trackEvent } from '../../services/telemetry';
import { Button } from '../ui';
import './LanguageMenu.scss';

/** Themed language picker: an outline button that opens an animated menu. */
export function LanguageMenu() {
  const { t, lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const choose = (code: Lang) => {
    trackEvent('change_language', { lang: code });
    setLang(code);
    setOpen(false);
  };

  return (
    <div className="language-menu" ref={rootRef}>
      <Button
        variant="outline"
        aria-label={t('header.language')}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
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
        <div className="language-menu__list" role="menu" aria-label={t('header.language')}>
          {(Object.entries(LANGUAGES) as [Lang, string][]).map(([code, name]) => (
            <button
              key={code}
              type="button"
              role="menuitemradio"
              aria-checked={code === lang}
              className="language-menu__item"
              onClick={() => choose(code)}
            >
              {name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
