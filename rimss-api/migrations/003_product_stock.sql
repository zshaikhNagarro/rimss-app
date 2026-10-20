-- Quantity on hand; in_stock stays as the availability flag.
ALTER TABLE products ADD COLUMN stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0);
UPDATE products SET stock = 25 WHERE in_stock;
