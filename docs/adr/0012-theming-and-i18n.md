# ADR 0012: Theming and UI translations

Status: accepted

## Context

Colours were compile-time SCSS values and UI strings were hard-coded, so neither dark mode nor a second language was possible.

## Decision

- **Theming:** the SCSS colour tokens in `styles/_variables.scss` now resolve to CSS custom properties (`var(--c-*)`). Light values live on `:root` and dark values on `:root[data-theme='dark']` in `index.scss`. Existing SCSS keeps using the same `$color-*` names.
- `hooks/useTheme` toggles `data-theme`, persists the choice in `localStorage` (`rimss.theme`) and defaults to `prefers-color-scheme`. The header button toggles it. Both themes are covered by the axe e2e check.
- **i18n:** a small in-house layer, `src/i18n` (`I18nProvider`, `useI18n`, `t(key, params, fallback)`), with all UI strings in `i18n/messages.ts` for English and Spanish. A test asserts both catalogs have the same keys. The language menu in the header persists the choice (`rimss.lang`) and sets `<html lang>`.
- Components work without a provider (they default to English), so unit tests and Storybook need no wrapper.
- Header layout: stacked and evenly gridded below 1024 px; the active nav item is highlighted.

## Consequences

- No i18n dependency to maintain; plural and date formatting are minimal. Revisit a library if more locales or ICU formats are needed.
- Chatbot replies (`responses.json`), product data and server error messages are not translated.
- New colours must use tokens, not literals, or they will not follow the theme.
