import { Link } from 'react-router-dom';
import { ErrorFallback } from '../../components/ErrorFallback';
import { ProductCard } from '../../components/ProductCard';
import { ProductGridSkeleton } from '../../components/Skeleton';
import { Heading } from '../../components/ui';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import { productService } from '../../services/productService';
import { useI18n } from '../../i18n';
import { useWishlist } from './wishlistStore';
import './WishlistModule.scss';

export function WishlistModule() {
  const { t } = useI18n();
  const ids = useWishlist();
  const { data, status, retry } = useAsyncResource(() => productService.search(), []);
  const saved = (data ?? []).filter((p) => ids.includes(p.id));

  return (
    <section>
      <Heading level={1}>{t('wishlist.title')}</Heading>
      {status === 'loading' && <ProductGridSkeleton />}
      {status === 'error' && (
        <ErrorFallback
          title={t('wishlist.loadError')}
          message={t('common.checkConnection')}
          onRetry={retry}
        />
      )}
      {status === 'ready' && saved.length === 0 && (
        <p>
          {t('wishlist.empty')} <Link to="/">{t('wishlist.browse')}</Link>.
        </p>
      )}
      {status === 'ready' && saved.length > 0 && (
        <div className="wishlist__grid">
          {saved.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
