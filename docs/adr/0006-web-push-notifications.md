# ADR 0006: Web Push notifications with VAPID

Status: accepted

## Context

Shoppers can opt in to notifications. The server must store subscriptions and broadcast safely.

## Decision

- Client (`services/pushService.ts`, `NotificationToggle`): feature-detects `serviceWorker`, `PushManager` and `Notification`; requests permission, fetches the VAPID key from `GET /api/push/public-key`, subscribes with `userVisibleOnly: true` and posts the subscription to `/api/push/subscribe`. Unsubscribing calls `/api/push/unsubscribe` and then the browser.
- Server (`routes/push.ts`, `push.ts`): `PushService` interface with file-backed (`data/subscriptions.json`) and Postgres implementations. VAPID keys come from `VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY`/`VAPID_SUBJECT`, otherwise they are generated and persisted in `data/vapid.json`.
- Payloads are validated with the shared schemas (`pushSubscriptionSchema`, `pushBroadcastSchema`, ADR 0003).
- `POST /api/push/send` is protected by `requireAdmin` (`ADMIN_API_KEY`).
- Subscription secrets are redacted in logs (ADR 0004).

## Consequences

- Browsers without Push support simply do not show the toggle.
- Production deployments should set VAPID keys explicitly so subscriptions survive redeploys.
