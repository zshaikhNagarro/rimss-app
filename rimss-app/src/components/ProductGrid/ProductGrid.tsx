import type { RefObject } from 'react';
import type { Product } from '../../types/product';
import { ProductCard } from '../ProductCard';
import { Grid } from '../ui';

/** Responsive grid of product cards, shared by search and wishlist. */
export function ProductGrid({
  products,
  className,
  gridRef,
}: Readonly<{
  products: Product[];
  className?: string;
  gridRef?: RefObject<HTMLDivElement | null>;
}>) {
  return (
    <Grid className={className} ref={gridRef}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </Grid>
  );
}
