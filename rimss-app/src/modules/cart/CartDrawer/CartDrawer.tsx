import { useEffect, useRef, useState } from 'react';
import { orderService } from '../../../services/orderService';
import { useSession } from '../../../services/session';
import { trackEvent } from '../../../services/telemetry';
import { formatPrice } from '../../../utils/price';
import type { Order } from '../../../types/order';
import { useCart } from '../CartContext';
import { getItemLineTotal } from '../cartLogic';
import { Button, Heading, Input } from '../../../components/ui';
import './CartDrawer.scss';
import { useI18n } from '../../../i18n';

const FOCUSABLE =
  'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

export function CartDrawer({
  open,
  onClose,
  onSignIn,
}: {
  open: boolean;
  onClose: () => void;
  /** Called when a signed-out user tries to check out. */
  onSignIn?: () => void;
}) {
  const { t } = useI18n();
  const session = useSession();
  const { cart, total, removeProduct, setQuantity, clearCart } = useCart();
  const dialogRef = useRef<HTMLElement>(null);
  const [checkout, setCheckout] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [order, setOrder] = useState<Order | null>(null);
  const [payment, setPayment] = useState<'idle' | 'paying' | 'error'>('idle');
  // Latest callback without re-running the focus effect on every parent render.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return onCloseRef.current();
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const nodes = dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || active === dialogRef.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  const handleCheckout = async () => {
    if (!session) return onSignIn?.();
    trackEvent('begin_checkout', { items: cart.items.length, total });
    setCheckout('submitting');
    try {
      const created = await orderService.createOrder(cart);
      trackEvent('checkout_success', { items: cart.items.length, total });
      setOrder(created);
      setPayment('idle');
      clearCart();
      setCheckout('idle');
    } catch {
      trackEvent('checkout_failed');
      setCheckout('error');
    }
  };

  // Demo gateway: the API just moves the order to PAID.
  const handlePay = async () => {
    if (!order) return;
    setPayment('paying');
    try {
      setOrder(await orderService.pay(order.id));
      trackEvent('payment_success', { orderId: order.id });
      setPayment('idle');
    } catch {
      trackEvent('payment_failed', { orderId: order.id });
      setPayment('error');
    }
  };

  return (
    <div className="cart-drawer-backdrop" onClick={onClose}>
      <aside
        ref={dialogRef}
        className="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="cart-drawer__header">
          <Heading level={2} size="lg" id="cart-drawer-title">
            {t('cart.title')}
          </Heading>
          <Button variant="icon" onClick={onClose} aria-label={t('cart.close')}>
            &times;
          </Button>
        </header>

        {order && cart.items.length === 0 && (
          <>
            <p className="cart-drawer__empty" role="status">
              {order.status === 'PAID'
                ? t('cart.paid', { id: order.id })
                : t('cart.placed', { id: order.id, total: formatPrice(order.total) })}
            </p>
            {order.status === 'PENDING_PAYMENT' && (
              <Button block disabled={payment === 'paying'} onClick={handlePay}>
                {payment === 'paying'
                  ? t('cart.paying')
                  : t('cart.payNow', { total: formatPrice(order.total) })}
              </Button>
            )}
            {payment === 'error' && (
              <p className="cart-drawer__empty" role="alert">
                {t('cart.payError')}
              </p>
            )}
          </>
        )}

        {cart.items.length === 0 ? (
          !order && <p className="cart-drawer__empty">{t('cart.empty')}</p>
        ) : (
          <ul className="cart-drawer__list">
            {cart.items.map((item) => (
              <li key={item.productId} className="cart-drawer__item">
                <div>
                  <p className="cart-drawer__item-name">{item.name}</p>
                  <p className="cart-drawer__item-price">{formatPrice(getItemLineTotal(item))}</p>
                </div>
                <div className="cart-drawer__item-controls">
                  <Input
                    compact
                    type="number"
                    min={1}
                    value={item.quantity}
                    aria-label={t('cart.quantityFor', { name: item.name })}
                    onChange={(e) => setQuantity(item.productId, Number(e.target.value))}
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      trackEvent('remove_from_cart', { productId: item.productId });
                      removeProduct(item.productId);
                    }}
                  >
                    {t('cart.remove')}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {checkout === 'error' && (
          <p className="cart-drawer__empty" role="alert">
            {t('cart.error')}
          </p>
        )}

        <footer className="cart-drawer__footer">
          {!session && cart.items.length > 0 && (
            <p className="cart-drawer__hint">{t('cart.signInRequired')}</p>
          )}
          <strong>{t('cart.total', { total: formatPrice(total) })}</strong>
          <Button
            size="lg"
            block
            disabled={cart.items.length === 0 || checkout === 'submitting'}
            onClick={handleCheckout}
          >
            {checkout === 'submitting'
              ? t('cart.placing')
              : session
                ? t('cart.checkout')
                : t('cart.signInToCheckout')}
          </Button>
        </footer>
      </aside>
    </div>
  );
}
