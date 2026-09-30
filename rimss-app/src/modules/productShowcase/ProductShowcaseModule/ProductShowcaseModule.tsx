import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { productService } from '../../../services/productService';
import type { Product } from '../../../types/product';
import { ProductDetailSkeleton } from '../../../components/Skeleton';
import { ErrorFallback } from '../../../components/ErrorFallback';
import { useCart } from '../../cart/CartContext';
import './ProductShowcaseModule.css';

export function ProductShowcaseModule() {
  const { id } = useParams<{ id: string }>();
  const { addProduct } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [addedMessage, setAddedMessage] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setStatus('loading');

    productService
      .getById(id)
      .then((data) => {
        if (cancelled) return;
        setProduct(data);
        setSelectedSize(data.sizes[0] ?? '');
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [id, reloadKey]);

  if (status === 'loading') return <ProductDetailSkeleton />;
  if (status === 'error' || !product) {
    return (
      <ErrorFallback
        title="Couldn't load this product"
        message="It may no longer exist, or the connection failed."
        onRetry={() => setReloadKey((k) => k + 1)}
      />
    );
  }

  const discountedPrice = product.price * (1 - product.discountPercent / 100);

  return (
    <section className="product-showcase">
      <div className="product-showcase__image-wrap">
        <img src={product.image} alt={product.name} />
      </div>

      <div className="product-showcase__details">
        <p className="product-showcase__category">{product.category}</p>
        <h1>{product.name}</h1>

        <div className="product-showcase__price">
          <span className="product-showcase__price--current">${discountedPrice.toFixed(2)}</span>
          {product.discountPercent > 0 && (
            <>
              <span className="product-showcase__price--original">${product.price.toFixed(2)}</span>
              <span className="product-showcase__discount-tag">-{product.discountPercent}%</span>
            </>
          )}
        </div>

        <p className="product-showcase__description">{product.description}</p>

        {product.sizes.length > 0 && (
          <div className="product-showcase__sizes">
            <span>Size</span>
            <div className="product-showcase__size-options">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  className={size === selectedSize ? 'selected' : ''}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        <p className={`product-showcase__stock ${product.inStock ? 'in' : 'out'}`}>
          {product.inStock ? 'In stock' : 'Out of stock'}
        </p>

        <button
          className="product-showcase__add-to-cart"
          disabled={!product.inStock}
          onClick={() => {
            addProduct(product, 1);
            setAddedMessage(true);
            setTimeout(() => setAddedMessage(false), 2000);
          }}
        >
          Add to Cart
        </button>

        {addedMessage && <p className="product-showcase__added">Added to cart!</p>}
      </div>
    </section>
  );
}
