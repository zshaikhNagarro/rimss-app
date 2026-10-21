import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAsyncResource } from '../../hooks/useAsyncResource';
import { productService } from '../../services/productService';
import { useI18n } from '../../i18n';
import { formatPrice, getDiscountedPrice } from '../../utils/price';
import { Button } from '../../components/ui';
import './OffersBanner.scss';

const HIDE_KEY = 'rimss.offers.hidden';
const OFFER_COUNT = 5;

// Theme is configurable per environment: VITE_OFFERS_THEME=accent|dark|light.
const theme = String(import.meta.env.VITE_OFFERS_THEME ?? 'accent');

export function OffersBanner() {
  const { t } = useI18n();
  const [hidden, setHidden] = useState(() => localStorage.getItem(HIDE_KEY) === '1');
  const [index, setIndex] = useState(0);
  const showRef = useRef<HTMLButtonElement>(null);
  const hideRef = useRef<HTMLButtonElement>(null);
  const toggled = useRef(false);
  const { data } = useAsyncResource(
    () => productService.searchPage({ discountedOnly: true }, 'desc', 0, OFFER_COUNT),
    [],
  );

  const toggle = (next: boolean) => {
    toggled.current = true;
    setHidden(next);
    localStorage.setItem(HIDE_KEY, next ? '1' : '0');
  };

  // The clicked button unmounts on toggle, so move focus to its replacement.
  useEffect(() => {
    if (!toggled.current) return;
    (hidden ? showRef : hideRef).current?.focus();
  }, [hidden]);

  const offers = data?.items ?? [];
  if (offers.length === 0) return null;

  if (hidden) {
    return (
      <Button ref={showRef} variant="ghost" size="sm" onClick={() => toggle(false)}>
        {t('offers.show')}
      </Button>
    );
  }

  const offer = offers[index % offers.length];
  const step = (d: number) => setIndex((i) => (i + d + offers.length) % offers.length);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'ArrowRight') step(1);
  };

  return (
    <section
      className={`offers offers--${theme}`}
      aria-label={t('offers.title')}
      onKeyDown={onKeyDown}
    >
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
        <Button variant="ghost" size="sm" onClick={() => step(-1)} aria-label={t('offers.prev')}>
          ‹
        </Button>
        <span>
          {(index % offers.length) + 1}/{offers.length}
        </span>
        <Button variant="ghost" size="sm" onClick={() => step(1)} aria-label={t('offers.next')}>
          ›
        </Button>
        <Button ref={hideRef} variant="ghost" size="sm" onClick={() => toggle(true)}>
          {t('offers.hide')}
        </Button>
      </div>
    </section>
  );
}
