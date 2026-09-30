# ADR 0002: Layered API with injected dependencies

Status: accepted

## Context

`rimss-api/src/app.ts` held every route, schema and middleware in one function, which made it hard to test and extend.

## Decision

- `app.ts` is only the composition root: security middleware plus feature routers mounted on `/api`.
- Feature routers live in `src/routes/` (`health`, `catalog`, `orders`, `push`). Each receives its dependencies as arguments: repositories and stores are interfaces (`ProductRepository`, `OrderStore`, `PushService`) with file/memory and Postgres implementations.
- Cross-cutting middleware (`requireAdmin`) lives in `src/middleware.ts`; errors use one envelope defined in `src/errors.ts`.
- Pricing stays server-side in `buildQuote`; clients send ids and quantities only.

## Consequences

- Tests inject in-memory implementations; Postgres is an implementation detail chosen in `server.ts`.
- Adding an endpoint group means adding one router and one `app.use` line.
