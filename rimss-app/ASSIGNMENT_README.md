# RIMSS Working Sample (Frontend)

Working sample for the YCompany RIMSS promotion assignment. React + TypeScript
frontend with a plugin-based architecture, backed by a Node.js mock API server.

## Structure

- `src/` — React + TypeScript SPA (Vite)
  - `plugins/PluginRegistry.ts` — pluggable functional module registry
  - `modules/productSearch/` — Product Search functional module (self-registers); filters, sort and search text are kept in the URL query string (`searchParams.ts`)
  - `modules/productShowcase/` — Product Showcase functional module (self-registers)
  - `modules/cart/` — Shopping cart business logic (pure functions), Context, `cartStorage.ts` (localStorage persistence) and the accessible cart drawer with checkout
  - `services/productService.ts` — API client used by modules (60 s cache with in-flight de-duplication via `requestCache.ts`)
  - `services/orderService.ts` — creates an order from the cart (ids and quantities only; the API prices it)
  - `hooks/` — `useAsyncResource` (load/retry/stale-response handling) and `useDebouncedValue`
  - `utils/price.ts` — discount and currency formatting helpers
- `mock-server/` — Express server serving static JSON product data (stand-in for
  YCompany's real backend APIs, which are out of scope per the assignment)

## Run locally

Terminal 1 — mock API (http://localhost:4000):

```
cd mock-server
npm install
npm start
```

Terminal 2 — frontend (http://localhost:5173):

```
npm install
npm run dev
```

## Test & build

```
npm test              # Vitest unit and component tests
npm run build
npm run test:e2e      # Playwright, includes axe accessibility checks
npm run check:size    # gzipped JS budget (run after build)
```

## Plugin architecture

New functional modules register themselves with `pluginRegistry.register({...})`
and are wired up automatically by the app shell (`App.tsx`) via routing — no
changes to shell code are required to add or remove a module. See
`src/modules/index.ts` for the single import point that activates all modules.

## Reliability and operations

- Resilient HTTP: src/services/httpClient.ts adds timeout and bounded retry with backoff (5xx and network errors only).
- Fault isolation: each module route is wrapped in ModuleErrorBoundary so one crash cannot take down the shell.
- Observability: src/services/telemetry.ts is a single sink (setTelemetrySink) receiving errors, retries and analytics events (`trackEvent`: page_view, add_to_cart, checkout_success/failed); plug in Sentry or App Insights there. By default events are beaconed to the API's `/telemetry` endpoint, which stores them in rimss-api/data/telemetry.json; set VITE_TELEMETRY_URL to use another collector. uncaught errors and unhandled rejections are captured globally.
- Feature flags: set VITE_DISABLED_MODULES=id1,id2 to disable modules per environment without code changes.
- Accessibility: the cart drawer is a modal dialog (focus trap, Escape to close, focus restored); Playwright runs axe against WCAG 2.1 A/AA.
- Security headers: public/_headers ships a Content-Security-Policy and related headers for Netlify/Cloudflare-style hosts; review its connect-src for your API origin.
- CI: .github/workflows/ci.yml runs format, lint, tests, build, npm audit, the bundle-size budget and the e2e suite on every push; Dependabot keeps dependencies current.
