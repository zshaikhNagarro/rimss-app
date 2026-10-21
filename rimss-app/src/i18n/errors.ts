import type { TFunction } from './index';

/** Localized text for an API error code (see `error.*` catalog keys); undefined when unknown. */
export function apiErrorMessage(e: unknown, t: TFunction): string | undefined {
  const code = (e as { code?: unknown } | null)?.code;
  if (typeof code !== 'string') return undefined;
  const text = t(`error.${code}`, undefined, '');
  return text || undefined;
}
