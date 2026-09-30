import type { CSSProperties } from 'react';
import './Skeleton.css';

export function Skeleton({
  width,
  height,
  style,
}: {
  width?: string;
  height?: string;
  style?: CSSProperties;
}) {
  return <span className="skeleton" aria-hidden="true" style={{ width, height, ...style }} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="product-card skeleton-card" aria-hidden="true">
      <div className="product-card__image-wrap skeleton" />
      <div className="product-card__body">
        <Skeleton width="40%" height="0.7rem" />
        <Skeleton width="80%" height="1rem" style={{ marginTop: '0.5rem' }} />
        <Skeleton width="30%" height="1rem" style={{ marginTop: '0.5rem' }} />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="product-search__grid"
      role="status"
      aria-busy="true"
      aria-label="Loading products"
    >
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <section
      className="product-showcase"
      role="status"
      aria-busy="true"
      aria-label="Loading product"
    >
      <div className="product-showcase__image-wrap skeleton" style={{ aspectRatio: '1 / 1' }} />
      <div className="product-showcase__details">
        <Skeleton width="25%" height="0.8rem" />
        <Skeleton width="70%" height="2rem" style={{ marginTop: '0.75rem' }} />
        <Skeleton width="35%" height="1.5rem" style={{ marginTop: '0.75rem' }} />
        <Skeleton width="100%" height="4rem" style={{ marginTop: '1rem' }} />
        <Skeleton width="50%" height="2.5rem" style={{ marginTop: '1rem' }} />
      </div>
    </section>
  );
}
