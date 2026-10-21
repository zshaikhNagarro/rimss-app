# ADR 0012: Theming and UI translations

Status: accepted

## Context

Colours were compile-time SCSS values and UI strings were hard-coded, so neither dark mode nor a second language was possible.

## Decision

- **Theming:** the SCSS colour tokens in `styles/_variables.scss` now resolve to CSS custom properties (`var(--c-*)`). Light values live on `:root` and dark values on `:root[data-theme='dark']` in `index.scss`. Existing SCSS keeps using the same `$color-*` names.
- `hooks/useTheme` toggles `data-theme`, persists the choice in `localStorage` (`rimss.theme`) and defaults to `prefers-color-scheme`. The theme toggle lives in the header avatar menu (`AccountMenu`). Both themes are covered by the axe e2e check.
- **i18n:** a small in-house layer, `src/i18n` (`I18nProvider`, `useI18n`, `t(key, params, fallback)`), with all UI strings in `i18n/messages.ts` for English and Spanish. A test asserts both catalogs have the same keys. The language menu in the header persists the choice (`rimss.lang`) and sets `<html lang>`.
- Components work without a provider (they default to English), so unit tests and Storybook need no wrapper.
- Header layout: stacked and evenly gridded below 1024 px; the active nav item is highlighted. The language and cart triggers share the nav-link style (plain text, growing underline); theme, alerts, sign in/out and signed-in pages are in the avatar menu.
- **Header search:** a `role="search"` form with a `ui-control` input. After a 250 ms debounce it calls `productService.searchPage({ q }, 'asc', 0, 6)` and lists the matches as links to `/product/:id`; Enter navigates to `/?q=...` (the Shop page filter). The list closes on Escape, blur or selection. Labels reuse the `search.*` catalog keys.
- `components/Footer` renders on every page (brand, links to Shop, Wishlist and Account, `© {year}` copyright). Its strings and the consent banner's live in the same catalogs, so the key-parity test covers them.

## Consequences

- No i18n dependency to maintain; plural and date formatting are minimal. Revisit a library if more locales or ICU formats are needed.
- Chatbot replies (`responses.json`), product data and server error messages are not translated.
- New colours must use tokens, not literals, or they will not follow the theme.
