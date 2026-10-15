import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../../types/product';
import { formatPrice, getDiscountedPrice } from '../../utils/price';
import { Card, Heading } from '../ui';
import './ProductCard.scss';
import '../Skeleton/Skeleton.scss';

export const ProductCard = memo(function ProductCard({ product }: { product: Product }) {
  const discountedPrice = getDiscountedPrice(product.price, product.discountPercent);
  const [imgState, setImgState] = useState<'loading' | 'loaded' | 'error'>('loading');

  return (
    <Card as={Link} to={`/product/${product.id}`} interactive className="product-card">
      <div className={`product-card__image-wrap ${imgState === 'loading' ? 'skeleton' : ''}`}>
        {imgState === 'error' ? (
          <div className="product-card__image-fallback">No image</div>
        ) : (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            decoding="async"
            style={{ opacity: imgState === 'loaded' ? 1 : 0 }}
            onLoad={() => setImgState('loaded')}
            onError={() => setImgState('error')}
          />
        )}
        {product.discountPercent > 0 && (
          <span className="product-card__badge">-{product.discountPercent}%</span>
        )}
        {!product.inStock && (
          <span className="product-card__badge product-card__badge--muted">Out of stock</span>
        )}
      </div>
      <div className="product-card__body">
        <p className="product-card__category">{product.category}</p>
        <Heading level={3} size="sm" className="product-card__name">
          {product.name}
        </Heading>
        <div className="product-card__price">
          <span className="product-card__price--current">{formatPrice(discountedPrice)}</span>
          {product.discountPercent > 0 && (
            <span className="product-card__price--original">{formatPrice(product.price)}</span>
          )}
        </div>
      </div>
    </Card>
  );
});
