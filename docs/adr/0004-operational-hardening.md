# ADR 0004: Operational hardening

Status: accepted

## Decision

- **TLS:** with `DATABASE_SSL=true` the API verifies the server certificate. `DATABASE_SSL_CA` supplies a private CA; `DATABASE_SSL_INSECURE=true` is an explicit opt-out for throwaway environments.
- **Idempotent orders:** `POST /api/orders` accepts an optional `Idempotency-Key` header. The key is stored on the order (unique column, migration 002); a replay returns `200` with the original order, and a concurrent duplicate resolves through the unique-index conflict. The key is not compared with the request body.
- **Logging:** pino with per-request ids (`x-request-id` reused when well formed, otherwise generated). Sensitive headers and push-subscription secrets are masked as `[REDACTED]`. Tests run silent.
- **Telemetry and analytics:** the frontend reports errors, HTTP retries and analytics events (`page_view`, `add_to_cart`, `checkout_success`, `checkout_failed`) through a single sink. By default events are posted to `POST /api/telemetry`, validated, and stored in `rimss-api/data/telemetry.json` (latest 1000 events, git-ignored). `VITE_TELEMETRY_URL` redirects them to an external collector.
- **Import cycles:** `import-x/no-cycle` fails lint on circular imports in the API, app and shared sources.
- **Containers:** multi-stage, non-root images with healthchecks; the web image proxies `/api` to the API so the browser is same-origin.

## Consequences

- Environments using self-signed database certificates must set `DATABASE_SSL_CA` or the insecure opt-out.
- Clients that want safe retries must generate and send an `Idempotency-Key` per checkout attempt.
- Local telemetry is a bounded JSON file, not a durable analytics store; use an external collector for production reporting.
