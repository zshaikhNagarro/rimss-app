# ADR 0007: Client-side resilience for data access

Status: accepted

## Context

Network calls from the browser fail intermittently, and several components request the same data.

## Decision

- `services/httpClient.ts`: `getJson` applies an 8 s timeout (`AbortController`) and up to 2 retries with exponential backoff, only for network errors and 5xx. 4xx responses fail immediately. Each retry emits an `http_retry` telemetry event.
- `postJson` is never retried automatically. Safe retries of orders require an `Idempotency-Key` (ADR 0004).
- `services/requestCache.ts`: in-memory TTL cache that de-duplicates concurrent identical requests and never caches failures.
- `hooks/useAsyncResource` and `useDebouncedValue` wrap loading state and search input; `Skeleton`, `Loader`, `ErrorFallback` and `ModuleErrorBoundary` provide loading and error UI so one failing module does not take down the page.
- Cart state persists through `cartStorage` in `localStorage`, tolerating unavailable or corrupt storage.
- E2E coverage for failures lives in `e2e/resilience.spec.ts`; accessibility in `e2e/accessibility.spec.ts` (axe).

## Consequences

- Reads tolerate transient failures; writes surface errors to the user instead of retrying silently.
- Cached data is per page load; the service worker (ADR 0005) covers cross-session caching.
