# RIMSS: What was built (panel walkthrough)

Quick reference for the panel. Detail lives in [ARCHITECTURE.md](ARCHITECTURE.md), the [ADRs](adr) and `deliverables/output`.

## 1. Requirements delivered

### Frontend (`rimss-app`, React + TypeScript + Vite)

| Area              | What was done                                                                                                          |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Product Search    | Search text, category, color, max price, discounted-only and sort; state kept in the URL so views are shareable.       |
| Product Showcase  | Product cards with discount and currency formatting (`utils/price.ts`).                                                |
| Cart and checkout | Pure-function cart logic, `localStorage` persistence, accessible drawer; checkout posts ids and quantities only.       |
| Pluggable modules | `PluginRegistry`: modules self-register and are routed by the shell, so adding or removing one needs no shell changes. |
| Feature flags     | `VITE_DISABLED_MODULES` disables modules per environment.                                                              |

### Backend (`rimss-api`, Express + TypeScript)

| Area              | What was done                                                                                   |
| ----------------- | ----------------------------------------------------------------------------------------------- |
| Catalog           | `GET /api/products` (filters), `/products/:id`, `/categories`, `/colors`.                       |
| Server-side price | `POST /api/cart/quote` and `POST /api/orders` price on the server; the client is never trusted. |
| Orders            | Create and read orders (`PENDING_PAYMENT`); optional `Idempotency-Key` makes retries safe.      |
| Persistence       | Postgres with migrations on startup; falls back to in-memory and JSON files without a database. |
| Shared contract   | `@rimss/shared` holds types and request schemas used by both the app and the API.               |

## 2. Enhancements beyond the requirements

| Enhancement            | FE / BE | Detail                                                                                                                                               |
| ---------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| PWA and offline        | FE      | Service worker caches the app shell, API (stale-while-revalidate) and images; update prompt.                                                         |
| Web Push notifications | FE + BE | Subscribe and unsubscribe, VAPID keys, admin-only broadcast via `x-api-key`.                                                                         |
| Rule-based chatbot     | FE      | Lightweight assistant component (ADR 0008).                                                                                                          |
| Client resilience      | FE      | HTTP timeout and bounded retry with backoff; request cache with de-duplication; per-module error boundary.                                           |
| Observability          | FE + BE | Telemetry sink (errors, `page_view`, `add_to_cart`, `checkout_*`) posted to `/api/telemetry`; JSON logs (pino) with request id and secret redaction. |
| Operational hardening  | BE      | Single error envelope, health and readiness (`/api/health`, `/api/ready`), CORS allowlist, Postgres TLS verification.                                |
| Accessibility          | FE      | Focus-trapped modal cart, Escape to close; axe WCAG 2.1 A/AA checks in Playwright.                                                                   |
| Security headers       | FE      | CSP and related headers in `public/_headers`; non-root containers.                                                                                   |
| Testing                | FE + BE | Vitest, API tests (pg-mem for Postgres), Playwright e2e, Storybook, bundle-size budget.                                                              |
| Delivery tooling       | Repo    | Turborepo monorepo, Docker Compose (Postgres and full stack), CI, Husky, commitlint, Dependabot.                                                     |

## 3. Key decisions (ADRs)

1. [0001](adr/0001-layered-web-app.md) layered web app
2. [0002](adr/0002-layered-api.md) layered API
3. [0003](adr/0003-shared-request-schemas.md) shared request schemas
4. [0004](adr/0004-operational-hardening.md) operational hardening
5. [0005](adr/0005-pwa-offline-and-delivery.md) PWA, offline and delivery
6. [0006](adr/0006-web-push-notifications.md) Web Push
7. [0007](adr/0007-client-resilience.md) client resilience
8. [0008](adr/0008-rule-based-chatbot.md) rule-based chatbot
9. [0009](adr/0009-monorepo-tooling.md) monorepo tooling

## 4. Likely panel questions

- **Why server-side pricing?** The client only sends ids and quantities, so prices cannot be tampered with (ADR 0002, 0003).
- **How do you add a new feature module?** Register it with `pluginRegistry.register({...})`; no shell edits.
- **What if the API is slow or down?** Timeout, retry with backoff, cached catalog, offline shell, error boundaries.
- **How are duplicate orders avoided?** `Idempotency-Key` replay returns the original order with `200`.
- **What is out of scope?** The payment gateway and YCompany's real backend; orders stop at `PENDING_PAYMENT`.
- **How is quality enforced?** Lint and architecture import rules, unit, API and e2e tests, axe checks, size budget, CI.

## 5. Added after review

- `GET /api/products` pagination (`limit`, `offset`, `X-Total-Count`).
- Mock payment lifecycle: `POST /api/orders/:id/pay` and `/cancel` (`PENDING_PAYMENT` to `PAID` or `CANCELLED`; other transitions return `409 INVALID_STATE`).
- `GET /metrics` (Prometheus text) and `GET /api/openapi.json`.
- Cart syncs across browser tabs.
- CodeQL workflow (`.github/workflows/codeql.yml`) and a k6 load test (`load-tests/api.js`).
- Authentication: `POST /api/auth/register` and `/login` (scrypt password hashing, HS256 JWT valid 1 h, stricter rate limit). `JWT_SECRET` is required in production.
- Order history: `GET /api/orders` (own orders only). Orders placed while signed in are hidden from other users (404); guest orders stay reachable by id.
- Stock quantity (`stock` column, migration 003): quotes and orders return `409 INSUFFICIENT_STOCK` or `OUT_OF_STOCK` when the quantity exceeds stock. Creating an order atomically decrements stock (a conditional `UPDATE` inside the order transaction in Postgres), so concurrent orders cannot oversell; cancelling an order restores it.
- Frontend: Account module (order history with profile summary, demo pay and cancel; visible and routable only when signed in), Wishlist module, name autocomplete, "Show more" paging and a reset action in search, low-stock message, Web Vitals reported to telemetry, reduced-motion support, dark mode (CSS custom properties, `data-theme`, persisted) and English/Spanish UI strings (`src/i18n`, persisted). Sign-in and register open in a modal (`AuthDialog`); checkout asks signed-out users to sign in, then reopens the cart and offers a demo payment (ADR 0010 to 0012).
- Delivery: Trivy image scan workflow (`.github/workflows/image-scan.yml`) and Kubernetes manifests (`k8s/`).

## 6. Known limitations and roadmap

- No payment gateway; payment is a mock status change.
- Stock is not reserved at quote time or on payment timeout: unpaid orders hold stock until cancelled.
- Auth has no refresh tokens, password reset or email verification; the token lives in `sessionStorage`.
- The UI requires sign-in to check out, but `POST /api/orders` still accepts guest orders from API clients.
- Search paging is client-side because filtering is client-side; the API pagination is not used by the UI yet.
- i18n covers UI chrome only: chatbot replies, product data and server error messages stay in English.
- Kubernetes manifests are a starting point: images, host, TLS and secrets must be supplied.

## 7. Related deliverables

Generated Word and Excel files are in `deliverables/output`: Solution Approach, Architecture Diagrams, Build Strategy (full and one-pager), DAR (Frontend Architecture Selection) and Estimation Sheet.
