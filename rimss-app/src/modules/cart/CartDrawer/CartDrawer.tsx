import { useRef } from 'react';
import { useModalFocus } from '../../../hooks/useModalFocus';
import { useSession } from '../../../services/session';
import { formatPrice } from '../../../utils/price';
import { useCart } from '../CartContext';
import { Button, Heading } from '../../../components/ui';
import './CartDrawer.scss';
import { useI18n } from '../../../i18n';
import { CartItem } from './CartItem';
import { useCheckout } from './useCheckout';

export function CartDrawer({
  open,
  onClose,
  onSignIn,
}: Readonly<{
  open: boolean;
  onClose: () => void;
  /** Called when a signed-out user tries to check out. */
  onSignIn?: () => void;
}>) {
  const { t } = useI18n();
  const session = useSession();
  const { cart, total } = useCart();
  const dialogRef = useRef<HTMLElement>(null);
  const { checkout, checkoutMessage, order, payment, placeOrder, pay } = useCheckout(
    Boolean(session),
    onSignIn,
  );
  useModalFocus(open, onClose, dialogRef, { focusDialog: true });

  if (!open) return null;

  const orderPlaced = Boolean(order) && cart.items.length === 0;

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

        {orderPlaced && order && (
          <>
            <p className="cart-drawer__empty" role="status">
              {order.status === 'PAID'
                ? t('cart.paid', { id: order.id })
                : t('cart.placed', { id: order.id, total: formatPrice(order.total) })}
            </p>
            {order.status === 'PENDING_PAYMENT' && (
              <Button block disabled={payment === 'paying'} onClick={pay}>
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
              <CartItem key={item.productId} item={item} />
            ))}
          </ul>
        )}

        {checkout === 'error' && (
          <p className="cart-drawer__empty" role="alert">
            {checkoutMessage ?? t('cart.error')}
          </p>
        )}

        {!orderPlaced && (
          <footer className="cart-drawer__footer">
            {!session && cart.items.length > 0 && (
              <p className="cart-drawer__hint">{t('cart.signInRequired')}</p>
            )}
            <strong>{t('cart.total', { total: formatPrice(total) })}</strong>
            <Button
              size="lg"
              block
              disabled={cart.items.length === 0 || checkout === 'submitting'}
              onClick={placeOrder}
            >
              {checkout === 'submitting'
                ? t('cart.placing')
                : session
                  ? t('cart.checkout')
                  : t('cart.signInToCheckout')}
            </Button>
          </footer>
        )}
      </aside>
    </div>
  );
}
