import fs from 'node:fs';
import path from 'node:path';
import type { Product, ProductFilters } from '@rimss/shared';
import { HttpError } from './errors.js';

export interface ProductRepository {
  search(filters: ProductFilters): Promise<Product[]>;
  byId(id: string): Promise<Product | undefined>;
  byIds(ids: string[]): Promise<Product[]>;
  categories(): Promise<string[]>;
  colors(): Promise<string[]>;
  /** Atomically decrements stock for all lines, or throws a 409 HttpError and changes nothing. */
  reserve(lines: StockLine[]): Promise<void>;
  /** Returns previously reserved stock. */
  release(lines: StockLine[]): Promise<void>;
}

export interface StockLine {
  productId: string;
  quantity: number;
}

export function stockError(name: string, available: number): HttpError {
  return available > 0
    ? new HttpError(409, 'INSUFFICIENT_STOCK', `Only ${available} of ${name} available`)
    : new HttpError(409, 'OUT_OF_STOCK', `${name} is out of stock`);
}

export function readSeedProducts(dataDir: string): Product[] {
  const raw: (Omit<Product, 'stock'> & { stock?: number })[] = JSON.parse(
    fs.readFileSync(path.join(dataDir, 'products.json'), 'utf8'),
  );
  return raw.map((p) => ({ ...p, stock: p.stock ?? (p.inStock ? 25 : 0) }));
}

function filterProducts(products: Product[], f: ProductFilters): Product[] {
  const q = f.q?.trim().toLowerCase();
  return products.filter(
    (p) =>
      (!q || p.name.toLowerCase().includes(q)) &&
      (!f.category || p.category.toLowerCase() === f.category.toLowerCase()) &&
      (!f.color || p.color.toLowerCase() === f.color.toLowerCase()) &&
      (f.maxPrice === undefined || p.price <= f.maxPrice) &&
      (!f.discountedOnly || p.discountPercent > 0),
  );
}

export function createFileProductRepository(dataDir: string): ProductRepository {
  const products = readSeedProducts(dataDir);
  const unique = (values: string[]) => [...new Set(values)];
  return {
    search: async (f) => filterProducts(products, f),
    byId: async (id) => products.find((p) => p.id === id),
    byIds: async (ids) => products.filter((p) => ids.includes(p.id)),
    categories: async () => unique(products.map((p) => p.category)),
    colors: async () => unique(products.map((p) => p.color)),
    // Synchronous check-then-write, so it is atomic within the single Node thread.
    async reserve(lines) {
      for (const { productId, quantity } of lines) {
        const p = products.find((x) => x.id === productId);
        if (!p || !p.inStock || p.stock < quantity)
          throw stockError(p?.name ?? productId, p?.stock ?? 0);
      }
      for (const { productId, quantity } of lines) {
        const p = products.find((x) => x.id === productId) as Product;
        p.stock -= quantity;
        p.inStock = p.stock > 0;
      }
    },
    async release(lines) {
      for (const { productId, quantity } of lines) {
        const p = products.find((x) => x.id === productId);
        if (!p) continue;
        p.stock += quantity;
        p.inStock = p.stock > 0;
      }
    },
  };
}
