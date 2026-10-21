# ADR 0011: Sign-in dialog and authenticated checkout

Status: accepted

## Context

Guests should be able to browse and fill a cart, but only signed-in users may place an order. Sign-in on a separate page interrupted that flow.

## Decision

- Sign-in and registration live in `components/AuthDialog`, a modal opened from the header "Sign in" button or from checkout. `App` mounts it only while open, so it always starts on the sign-in form with cleared fields.
- `CartDrawer` shows "Sign in to checkout" for signed-out users. Clicking it closes the cart and opens the dialog; after a successful sign-in the cart reopens. Cart contents persist throughout (ADR 0007).
- After the order is created the drawer offers a demo "Pay" action that calls `POST /api/orders/:id/pay`; the real gateway stays out of scope.
- `ModulePlugin` gains `requiresAuth`. The Account module sets it, so the nav hides it while signed out, and `/account` redirects to `/` without a session.
- The header avatar menu (`components/AccountMenu`) shows the signed-in pages (Account), theme, alerts and "Sign out" when signed in, and "Sign in" otherwise. The session lives in `services/session.ts` (`sessionStorage`, see ADR 0002 notes on JWT lifetime).
- The server-side `requireAuth` rules are unchanged; hiding UI is not the security boundary.
- **Inactivity sign-out:** while a session exists, `Header` runs a 30-minute timer that resets on mouse, keyboard, scroll and touch activity. On expiry it calls `authService.logout()` and emits `logout` with `reason: 'inactivity'`. The timer is per tab and client-side only; the JWT itself is not shortened.

## Consequences

- Guests never see an auth page; auth errors appear inline in the dialog.
- `POST /api/orders` still accepts guest orders for API clients; the UI simply requires sign-in. Enforcing it server-side would be a separate change.
