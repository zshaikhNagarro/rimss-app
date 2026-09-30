import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { productService } from '../../../services/productService';
import { useAsyncResource } from '../../../hooks/useAsyncResource';
import { formatPrice, getDiscountedPrice } from '../../../utils/price';
import { ProductDetailSkeleton } from '../../../components/Skeleton';
import { ErrorFallback } from '../../../components/ErrorFallback';
import { useCart } from '../../cart';
import './ProductShowcaseModule.css';

const ADDED_MESSAGE_MS = 2000;

export function ProductShowcaseModule() {
  const { id } = useParams<{ id: string }>();
  const { addProduct } = useCart();

  const {
    data: product,
    status,
    retry,
  } = useAsyncResource(() => productService.getById(id!), [id], Boolean(id));
  const [selectedSize, setSelectedSize] = useState<string>();
  const [addedMessage, setAddedMessage] = useState(false);

  useEffect(() => {
    if (!addedMessage) return;
    const timer = setTimeout(() => setAddedMessage(false), ADDED_MESSAGE_MS);
    return () => clearTimeout(timer);
  }, [addedMessage]);

  if (status === 'loading') return <ProductDetailSkeleton />;
  if (status === 'error' || !product) {
    return (
      <ErrorFallback
        title="Couldn't load this product"
        message="It may no longer exist, or the connection failed."
        onRetry={retry}
      />
    );
  }

  const size =
    selectedSize && product.sizes.includes(selectedSize) ? selectedSize : (product.sizes[0] ?? '');
  const discountedPrice = getDiscountedPrice(product.price, product.discountPercent);

  return (
    <section className="product-showcase">
      <div className="product-showcase__image-wrap">
        <img src={product.image} alt={product.name} />
      </div>

      <div className="product-showcase__details">
        <p className="product-showcase__category">{product.category}</p>
        <h1>{product.name}</h1>

        <div className="product-showcase__price">
          <span className="product-showcase__price--current">{formatPrice(discountedPrice)}</span>
          {product.discountPercent > 0 && (
            <>
              <span className="product-showcase__price--original">
                {formatPrice(product.price)}
              </span>
              <span className="product-showcase__discount-tag">-{product.discountPercent}%</span>
            </>
          )}
        </div>

        <p className="product-showcase__description">{product.description}</p>

        {product.sizes.length > 0 && (
          <div className="product-showcase__sizes">
            <span>Size</span>
            <div className="product-showcase__size-options">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  className={s === size ? 'selected' : ''}
                  onClick={() => setSelectedSize(s)}
                >
                  {s}
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
          }}
        >
          Add to Cart
        </button>

        {addedMessage && <p className="product-showcase__added">Added to cart!</p>}
      </div>
    </section>
  );
}
