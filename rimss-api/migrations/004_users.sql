CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Orders placed while signed in belong to a user; guest orders keep user_id NULL.
ALTER TABLE orders ADD COLUMN user_id TEXT REFERENCES users (id);
CREATE INDEX orders_user_id_idx ON orders (user_id);
