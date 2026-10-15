# ADR 0003: Request schemas live in the shared contract

Status: accepted

## Context

Types were shared through `@rimss/shared`, but the zod validation schemas existed only in the API, so the request shape could drift from the client types.

## Decision

- `@rimss/shared` exports the request schemas (`productFiltersQuerySchema`, `orderRequestSchema`, `pushSubscriptionSchema`, `pushBroadcastSchema`) and types inferred from them (for example `OrderRequest`).
- The API validates with these schemas; the web app imports types only, so zod is not added to the browser bundle (`npm run check:size` guards this).

## Consequences

- One change updates validation and client typing together.
- `@rimss/shared` has a runtime dependency on `zod`.
