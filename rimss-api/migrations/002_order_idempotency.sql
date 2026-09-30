-- Replays of the same Idempotency-Key return the original order.
ALTER TABLE orders ADD COLUMN idempotency_key TEXT UNIQUE;
