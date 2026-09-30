# RIMSS monorepo

Everything for the YCompany RIMSS assignment in one place, orchestrated by [Turborepo](https://turbo.build) and npm workspaces.

| Workspace       | Path                                 | Purpose                                                                                               |
| --------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `rimss-app`     | [rimss-app](rimss-app)               | React + TypeScript SPA (plugin architecture, PWA, Web Push, Storybook, Vitest, Playwright)            |
| `@rimss/api`    | [rimss-api](rimss-api)               | Express + TypeScript backend: catalog, server-side pricing, orders, push                              |
| `@rimss/shared` | [packages/shared](packages/shared)   | Types and helpers shared by the app and the API                                                       |
| `gen`           | [deliverables/gen](deliverables/gen) | Generators for the solution approach, estimation sheet and strategy documents (`deliverables/output`) |

## Getting started

```
npm install          # once, from the repo root
npm run dev          # shared build, then API (http://localhost:4000) and web (http://localhost:5173) together
```

## Common commands (run from the root)

| Command             | What it does                                                             |
| ------------------- | ------------------------------------------------------------------------ |
| `npm run dev`       | API and web in watch mode                                                |
| `npm run build`     | Builds shared, API and web (cached)                                      |
| `npm run lint`      | Type-checks / lints every workspace                                      |
| `npm test`          | Unit and API tests in every workspace                                    |
| `npm run test:e2e`  | Playwright end-to-end tests (starts its own API on 4199 and web on 5199) |
| `npm run storybook` | Storybook on http://localhost:6006                                       |
| `npm run docs`      | Regenerates the deliverable documents                                    |
| `npm run verify`    | format check + lint + test + build                                       |

Run one workspace with `npx turbo run test --filter=@rimss/api`.

## Code quality

- Git hooks (Husky, installed by `npm install` once the folder is a git repo): `pre-commit` runs lint-staged (ESLint and Prettier on staged files); `commit-msg` enforces [Conventional Commits](https://www.conventionalcommits.org) via commitlint.
- `.editorconfig` and Prettier keep formatting consistent; `engines` requires Node 22 or newer.
- Architecture rules are enforced by ESLint (
  o-restricted-imports, type-aware promise rules); decisions are recorded in [docs/adr](docs/adr).
- CI ([.github/workflows/ci.yml](.github/workflows/ci.yml)): `verify`, `npm audit`, the bundle-size budget (`npm run check:size --workspace rimss-app`) and Playwright e2e including axe accessibility checks (separate erify and e2e jobs, Turbo cache, concurrency cancel).

## Web app behaviour

- The cart persists in `localStorage`; checkout posts ids and quantities to `POST /api/orders` and shows the order id.
- Search filters and sort live in the URL (for example `/?category=Jackets&sort=desc`).
- Optional `rimss-app` environment variables: `VITE_API_BASE_URL`, `VITE_DISABLED_MODULES`, `VITE_TELEMETRY_URL`.

## API summary

| Method and path                                                                                                               | Description                                                                          |
| ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `GET /api/health`                                                                                                             | Liveness                                                                             |
| `GET /api/products`                                                                                                           | Search: `q`, `category`, `color`, `maxPrice`, `discountedOnly`                       |
| `GET /api/products/:id`, `/api/categories`, `/api/colors`                                                                     | Catalog                                                                              |
| `POST /api/cart/quote`                                                                                                        | Server-side pricing for `{ items: [{ productId, quantity }] }`                       |
| `POST /api/orders` (optional `Idempotency-Key` header; a replay returns `200` with the original order), `GET /api/orders/:id` | Create and read an order (status `PENDING_PAYMENT`; payment gateway is out of scope) |
| `GET /api/push/public-key`, `POST /api/push/subscribe`, `POST /api/push/unsubscribe`                                          | Web Push subscription                                                                |
| `POST /api/push/send`                                                                                                         | Broadcast; requires header `x-api-key` matching `ADMIN_API_KEY`                      |

Configuration (environment variables): `PORT`, `CORS_ORIGINS` (comma-separated), `ADMIN_API_KEY`, `VAPID_SUBJECT`, `DATA_DIR`, `DATABASE_URL`, `DATABASE_SSL`, `DATABASE_SSL_CA`, `DATABASE_SSL_INSECURE`, `LOG_LEVEL`, `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` (see [rimss-api/.env.example](rimss-api/.env.example)).

## Postgres

With `DATABASE_URL` set, the API stores products, orders (with lines) and push subscriptions in Postgres. Migrations in [rimss-api/migrations](rimss-api/migrations) are applied on startup and tracked in `schema_migrations`; the catalog is seeded from `rimss-api/data/products.json` only when the table is empty. Without `DATABASE_URL` it falls back to in-memory orders and JSON files (used by the e2e tests).

```
docker compose up -d postgres
# PowerShell
$env:DATABASE_URL = "postgres://rimss:rimss@localhost:5432/rimss"; $env:ADMIN_API_KEY = "change-me"
npm run dev
```

`GET /api/ready` checks the database connection (503 when it is down). API tests run the Postgres code against an in-process emulator (pg-mem), so no database is needed for `npm test`.

Errors use one envelope: `{ "error": { "code": "...", "message": "..." } }`.

## Containers

- `docker compose up -d postgres` starts only the database (as above).
- `docker compose --profile full up --build` also builds [rimss-api/Dockerfile](rimss-api/Dockerfile) and [rimss-app/Dockerfile](rimss-app/Dockerfile) (nginx serving the SPA and proxying `/api`) and serves the app on http://localhost:8080. Both images run as non-root and define healthchecks.
- Logs are JSON (pino) with an `x-request-id` per request; set `LOG_LEVEL` to change verbosity.
- Postgres TLS verifies certificates by default; provide `DATABASE_SSL_CA` for a private CA.
