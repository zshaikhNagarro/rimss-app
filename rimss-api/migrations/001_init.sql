-- Applied once per file (tracked in schema_migrations).
CREATE TABLE IF NOT EXISTS products (
  id               TEXT PRIMARY KEY,
  name             TEXT NOT NULL,
  category         TEXT NOT NULL,
  color            TEXT NOT NULL,
  price            NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  discount_percent INTEGER NOT NULL DEFAULT 0 CHECK (discount_percent BETWEEN 0 AND 100),
  image            TEXT NOT NULL,
  description      TEXT NOT NULL,
  sizes            JSONB NOT NULL DEFAULT '[]',
  in_stock         BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);
CREATE INDEX IF NOT EXISTS idx_products_color ON products (color);

CREATE TABLE IF NOT EXISTS orders (
  id             TEXT PRIMARY KEY,
  status         TEXT NOT NULL,
  subtotal       NUMERIC(12, 2) NOT NULL,
  discount_total NUMERIC(12, 2) NOT NULL,
  total          NUMERIC(12, 2) NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS order_lines (
  order_id         TEXT NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  product_id       TEXT NOT NULL,
  name             TEXT NOT NULL,
  quantity         INTEGER NOT NULL CHECK (quantity > 0),
  discount_percent INTEGER NOT NULL,
  unit_price       NUMERIC(10, 2) NOT NULL,
  line_total       NUMERIC(12, 2) NOT NULL,
  PRIMARY KEY (order_id, product_id)
);

CREATE TABLE IF NOT EXISTS push_subscriptions (
  endpoint        TEXT PRIMARY KEY,
  p256dh          TEXT NOT NULL,
  auth            TEXT NOT NULL,
  expiration_time BIGINT
);
