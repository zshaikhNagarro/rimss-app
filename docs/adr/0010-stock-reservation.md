# ADR 0010: Stock reservation when an order is created

Status: accepted

## Context

Orders validated stock but never reduced it, so concurrent orders for the last units could both succeed.

## Decision

- `ProductRepository` gains `reserve(lines)` and `release(lines)`. `reserve` is all-or-nothing and throws `409 INSUFFICIENT_STOCK` or `OUT_OF_STOCK`.
- Postgres: `createPgOrderStore.create` reserves stock inside the order transaction with a conditional `UPDATE ... WHERE stock >= $qty`, locking rows in product-id order to avoid deadlocks. A rollback (including an idempotency-key conflict) undoes the reservation.
- Cancelling an order (`setStatus(..., 'CANCELLED')`) restores stock in the same transaction that updates the status.
- In-memory mode: `createMemoryOrderStore(products)` calls the same `reserve`/`release` on the file repository, which is atomic on the single Node thread.
- `in_stock` is recomputed as `stock > 0` on every change.

## Consequences

- Concurrent orders can no longer oversell; the loser receives a `409`.
- Unpaid orders hold stock until cancelled; there is no payment timeout or automatic release.
- Quotes (`/cart/quote`) still only validate, they do not reserve.
