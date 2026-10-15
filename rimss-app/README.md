# rimss-app

React 19 + TypeScript + Vite single-page app for YCompany RIMSS. See [ASSIGNMENT_README.md](ASSIGNMENT_README.md) for the module layout and the [root README](../README.md) for monorepo commands.

## Scripts

| Command              | Purpose                                                    |
| -------------------- | ---------------------------------------------------------- |
| `npm run dev`        | Vite dev server (http://localhost:5173)                    |
| `npm test`           | Vitest unit and component tests                            |
| `npm run test:e2e`   | Playwright end-to-end tests, including axe accessibility   |
| `npm run build`      | Type-check and production build                            |
| `npm run check:size` | Fails when gzipped JS exceeds the budget (run after build) |
| `npm run storybook`  | Component explorer on http://localhost:6006                |

## Configuration

| Variable                | Purpose                                                                                                                                                        |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_API_BASE_URL`     | API base URL (default `http://localhost:4000/api`)                                                                                                             |
| `VITE_DISABLED_MODULES` | Comma-separated plugin ids to switch off                                                                                                                       |
| `VITE_TELEMETRY_URL`    | Endpoint receiving error, retry and analytics events via `sendBeacon`; defaults to `<VITE_API_BASE_URL>/telemetry` (stored in `rimss-api/data/telemetry.json`) |

## Behaviour worth knowing

- Cart contents persist in `localStorage` (`rimss.cart.v1`); malformed entries are discarded on load.
- Search state (`q`, `category`, `color`, `maxPrice`, `discountedOnly`, `sort`) is mirrored into the URL; the name box is debounced by 250 ms.
- Catalog GETs are cached for 60 s and de-duplicated; failures are never cached. Order creation is never retried.
- `public/_headers` carries the production CSP and security headers for Netlify/Cloudflare-style hosts.
