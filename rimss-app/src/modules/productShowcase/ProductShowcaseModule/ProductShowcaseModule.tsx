import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { productService } from '../../../services/productService';
import { useAsyncResource } from '../../../hooks/useAsyncResource';
import { formatPrice, getDiscountedPrice } from '../../../utils/price';
import { ProductDetailSkeleton } from '../../../components/Skeleton';
import { ErrorFallback } from '../../../components/ErrorFallback';
import { Button, Heading } from '../../../components/ui';
import { useCart } from '../../cart';
import { useI18n } from '../../../i18n';
import { useWishlist, wishlist } from '../../wishlist/wishlistStore';
import './ProductShowcaseModule.scss';

const ADDED_MESSAGE_MS = 2000;
const LOW_STOCK = 5;

export function ProductShowcaseModule() {
  const { t } = useI18n();
  const { id } = useParams<{ id: string }>();
  const { addProduct } = useCart();
  const wishlisted = useWishlist().includes(id ?? '');

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
        title={t('product.loadError')}
        message={t('product.loadErrorHint')}
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
        <Heading level={1}>{product.name}</Heading>

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
            <span>{t('product.size')}</span>
            <div className="product-showcase__size-options">
              {product.sizes.map((s) => (
                <Button
                  key={s}
                  variant="secondary"
                  size="sm"
                  selected={s === size}
                  onClick={() => setSelectedSize(s)}
                >
                  {s}
                </Button>
              ))}
            </div>
          </div>
        )}

        <p className={`product-showcase__stock ${product.inStock ? 'in' : 'out'}`}>
          {!product.inStock && t('product.outOfStock')}
          {product.inStock &&
            product.stock <= LOW_STOCK &&
            t('product.onlyLeft', { count: product.stock })}
          {product.inStock && product.stock > LOW_STOCK && t('product.inStock')}
        </p>

        <div className="product-showcase__actions">
          <Button
            size="lg"
            disabled={!product.inStock}
            onClick={() => {
              addProduct(product, 1);
              setAddedMessage(true);
            }}
          >
            {t('product.addToCart')}
          </Button>
          <Button
            variant="outline"
            size="lg"
            selected={wishlisted}
            onClick={() => wishlist.toggle(product.id)}
          >
            {wishlisted ? t('product.wishlisted') : t('product.saveToWishlist')}
          </Button>
        </div>

        {addedMessage && <p className="product-showcase__added">{t('product.added')}</p>}
      </div>
    </section>
  );
}
