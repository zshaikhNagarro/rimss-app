import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import { productService } from '../../services/productService';
import { useI18n } from '../../i18n';
import { formatPrice, getDiscountedPrice } from '../../utils/price';
import './OffersBanner.scss';

const HIDE_KEY = 'rimss.offers.hidden';
const OFFER_COUNT = 5;

// Theme is configurable per environment: VITE_OFFERS_THEME=accent|dark|light.
const theme = String(import.meta.env.VITE_OFFERS_THEME ?? 'accent');

export function OffersBanner() {
  const { t } = useI18n();
  const [hidden, setHidden] = useState(() => localStorage.getItem(HIDE_KEY) === '1');
  const [index, setIndex] = useState(0);
  const { data } = useAsyncResource(
    () => productService.searchPage({ discountedOnly: true }, 'desc', 0, OFFER_COUNT),
    [],
  );

  const toggle = (next: boolean) => {
    setHidden(next);
    localStorage.setItem(HIDE_KEY, next ? '1' : '0');
  };

  const offers = data?.items ?? [];
  if (offers.length === 0) return null;

  if (hidden) {
    return (
      <button type="button" className="offers__show" onClick={() => toggle(false)}>
        {t('offers.show')}
      </button>
    );
  }

  const offer = offers[index % offers.length];
  const step = (d: number) => setIndex((i) => (i + d + offers.length) % offers.length);

  return (
    <section className={`offers offers--${theme}`} aria-label={t('offers.title')}>
      <div className="offers__text" aria-live="polite">
        <p className="offers__eyebrow">{t('offers.title')}</p>
        <p className="offers__headline">
          {t('offers.headline', { name: offer.name, percent: offer.discountPercent })}
        </p>
        <p className="offers__price">
          {formatPrice(getDiscountedPrice(offer.price, offer.discountPercent))}{' '}
          <s>{formatPrice(offer.price)}</s>
        </p>
        <Link className="offers__cta" to={`/product/${offer.id}`}>
          {t('offers.view')}
        </Link>
      </div>
      <div className="offers__controls">
        <button type="button" onClick={() => step(-1)} aria-label={t('offers.prev')}>
          ‹
        </button>
        <span>
          {(index % offers.length) + 1}/{offers.length}
        </span>
        <button type="button" onClick={() => step(1)} aria-label={t('offers.next')}>
          ›
        </button>
        <button type="button" onClick={() => toggle(true)}>
          {t('offers.hide')}
        </button>
      </div>
    </section>
  );
}
