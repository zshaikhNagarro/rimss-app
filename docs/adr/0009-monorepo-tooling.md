# ADR 0009: npm workspaces monorepo with Turborepo

Status: accepted

## Context

The repository holds the web app (`rimss-app`), the API (`rimss-api`) and the shared contract (`packages/shared`). `rimss-app` and `rimss-api` both depend on `@rimss/shared` build output.

## Decision

- npm workspaces plus Turborepo orchestrate `build`, `lint`, `test`, `test:e2e`, `dev`, `storybook` and `docs`. Tasks depend on `^build` so `@rimss/shared` is built first; `dev`, `storybook` and `test:e2e` are uncached, and `dev`/`storybook` are persistent.
- A single root ESLint config enforces layering (ADR 0001) and import cycles (ADR 0004); commitlint enforces commit messages.
- Testing: Vitest (unit, API incl. Postgres), Playwright (e2e, axe accessibility), Storybook for UI components.
- `docker-compose.yml` runs the API, Postgres and the nginx-served web image (ADR 0004).
- Project deliverables (solution approach, estimation, DAR) are generated from `deliverables/gen` and are not part of the runtime build.

## Consequences

- Changes to `@rimss/shared` rebuild dependents; CI benefits from Turborepo caching.
- Turborepo behaviour should be checked against the installed version's bundled docs before changing `turbo.json`.
