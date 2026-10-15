# ADR 0005: Installable PWA with offline caching and hardened delivery

Status: accepted

## Context

RIMSS is a shopping experience that must start quickly, survive flaky networks and be installable on mobile.

## Decision

- `vite-plugin-pwa` generates the service worker and manifest (`display: standalone`, 192/512 and maskable icons). `registerType: 'autoUpdate'`; registration is manual through the `useRegisterSW` hook in `UpdatePrompt`, so `injectRegister` is `null`.
- Precache the app shell (`js, css, html, svg, png, ico`) for offline start-up.
- Runtime caching: `/api/*` uses `StaleWhileRevalidate` (`rimss-api-cache`, 100 entries, 1 day); images use `CacheFirst` (`rimss-image-cache`, 60 entries, 7 days).
- The service worker imports `public/push-sw.js` for push handling (see ADR 0006).
- The build splits React and router into a long-cached `react` chunk. `scripts/check-bundle-size.mjs` (`npm run check:size`) guards bundle growth.
- Security headers (CSP, HSTS, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`) are set in `public/_headers`; `vite preview` sends the host-independent subset. `nginx.conf` serves the container image.

## Consequences

- Catalog data can be briefly stale; users see fresh data after the background refresh.
- Changes to the CSP `connect-src` are needed when the API origin changes.
- A new service worker is activated through the update prompt flow.
