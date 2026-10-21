import { useState } from 'react';
import { orderService } from '../../../services/orderService';
import { trackEvent } from '../../../services/telemetry';
import { apiErrorMessage } from '../../../i18n/errors';
import { useI18n } from '../../../i18n';
import type { Order } from '../../../types/order';
import { useCart } from '../CartContext';

/** Checkout and demo-payment flow for the cart drawer. */
export function useCheckout(signedIn: boolean, onSignIn?: () => void) {
  const { t } = useI18n();
  const { cart, total, clearCart } = useCart();
  const [checkout, setCheckout] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [checkoutMessage, setCheckoutMessage] = useState<string>();
  const [order, setOrder] = useState<Order | null>(null);
  const [payment, setPayment] = useState<'idle' | 'paying' | 'error'>('idle');

  const placeOrder = async () => {
    if (!signedIn) return onSignIn?.();
    trackEvent('begin_checkout', { items: cart.items.length, total });
    setCheckoutMessage(undefined);
    setCheckout('submitting');
    try {
      const created = await orderService.createOrder(cart);
      trackEvent('checkout_success', { items: cart.items.length, total });
      setOrder(created);
      setPayment('idle');
      clearCart();
      setCheckout('idle');
    } catch (err) {
      trackEvent('checkout_failed');
      setCheckoutMessage(apiErrorMessage(err, t));
      setCheckout('error');
    }
  };

  // Demo gateway: the API just moves the order to PAID.
  const pay = async () => {
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

  return { checkout, checkoutMessage, order, payment, placeOrder, pay };
}
