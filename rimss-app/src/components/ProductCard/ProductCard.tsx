import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../../types/product';
import { formatPrice, getDiscountedPrice } from '../../utils/price';
import './ProductCard.css';
import '../Skeleton/Skeleton.css';

export const ProductCard = memo(function ProductCard({ product }: { product: Product }) {
  const discountedPrice = getDiscountedPrice(product.price, product.discountPercent);
  const [imgState, setImgState] = useState<'loading' | 'loaded' | 'error'>('loading');

  return (
    <Link to={`/product/${product.id}`} className="product-card">
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
        <h3 className="product-card__name">{product.name}</h3>
        <div className="product-card__price">
          <span className="product-card__price--current">{formatPrice(discountedPrice)}</span>
          {product.discountPercent > 0 && (
            <span className="product-card__price--original">{formatPrice(product.price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
});
