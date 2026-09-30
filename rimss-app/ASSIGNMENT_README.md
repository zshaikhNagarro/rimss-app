# RIMSS Working Sample (Frontend)

Working sample for the YCompany RIMSS promotion assignment. React + TypeScript
frontend with a plugin-based architecture, backed by a Node.js mock API server.

## Structure

- `src/` — React + TypeScript SPA (Vite)
  - `plugins/PluginRegistry.ts` — pluggable functional module registry
  - `modules/productSearch/` — Product Search functional module (self-registers)
  - `modules/productShowcase/` — Product Showcase functional module (self-registers)
  - `modules/cart/` — Shopping cart business logic (pure functions) + Context + UI
  - `services/productService.ts` — API client used by modules
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
npm test    # runs Vitest unit tests for the business layer (cart, filtering)
npm run build
```

## Plugin architecture

New functional modules register themselves with `pluginRegistry.register({...})`
and are wired up automatically by the app shell (`App.tsx`) via routing — no
changes to shell code are required to add or remove a module. See
`src/modules/index.ts` for the single import point that activates all modules.

## Reliability and operations

- Resilient HTTP: src/services/httpClient.ts adds timeout and bounded retry with backoff (5xx and network errors only).
- Fault isolation: each module route is wrapped in ModuleErrorBoundary so one crash cannot take down the shell.
- Observability: src/services/telemetry.ts is a single sink (setTelemetrySink) receiving errors and retries; plug in Sentry or App Insights there.
- Feature flags: set VITE_DISABLED_MODULES=id1,id2 to disable modules per environment without code changes.
- CI: .github/workflows/ci.yml runs lint, tests and build on every push.
