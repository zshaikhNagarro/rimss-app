import fs from 'node:fs';
import path from 'node:path';
import type { Product, ProductFilters } from '@rimss/shared';

export interface ProductRepository {
  search(filters: ProductFilters): Promise<Product[]>;
  byId(id: string): Promise<Product | undefined>;
  byIds(ids: string[]): Promise<Product[]>;
  categories(): Promise<string[]>;
  colors(): Promise<string[]>;
}

export function readSeedProducts(dataDir: string): Product[] {
  return JSON.parse(fs.readFileSync(path.join(dataDir, 'products.json'), 'utf8'));
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
  };
}
