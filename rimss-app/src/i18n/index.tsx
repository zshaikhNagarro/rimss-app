import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { en, es } from './messages';

export type Lang = 'en' | 'es';
export const LANGUAGES: Record<Lang, string> = { en: 'English', es: 'Español' };

type Params = Record<string, string | number>;
export type TFunction = (key: string, params?: Params, fallback?: string) => string;

const STORAGE_KEY = 'rimss.lang';
const catalogs: Record<Lang, Record<string, string>> = { en, es };

export function getInitialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'es') return saved;
  } catch {
    // Storage can be blocked; fall through to the browser language.
  }
  return typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('es')
    ? 'es'
    : 'en';
}

export function translate(lang: Lang, key: string, params?: Params, fallback?: string): string {
  const template = catalogs[lang][key] ?? en[key] ?? fallback ?? key;
  return params
    ? template.replace(/\{(\w+)\}/g, (m, name: string) => String(params[name] ?? m))
    : template;
}

interface I18nValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: TFunction;
}

// Defaults to English so components render without a provider (unit tests, Storybook).
const I18nContext = createContext<I18nValue>({
  lang: 'en',
  setLang: () => {},
  t: (key, params, fallback) => translate('en', key, params, fallback),
});

export function I18nProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [lang, setLang] = useState<Lang>(getInitialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Preference just will not persist.
    }
  }, [lang]);

  const t = useCallback<TFunction>(
    (key, params, fallback) => translate(lang, key, params, fallback),
    [lang],
  );
  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
