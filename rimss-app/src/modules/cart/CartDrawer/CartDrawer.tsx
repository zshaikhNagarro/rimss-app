import { useEffect, useRef, useState } from 'react';
import { orderService } from '../../../services/orderService';
import { formatPrice } from '../../../utils/price';
import type { Order } from '../../../types/order';
import { useCart } from '../CartContext';
import { getItemLineTotal } from '../cartLogic';
import './CartDrawer.css';

const FOCUSABLE =
  'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { cart, total, removeProduct, setQuantity, clearCart } = useCart();
  const dialogRef = useRef<HTMLElement>(null);
  const [checkout, setCheckout] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [order, setOrder] = useState<Order | null>(null);
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
    setCheckout('submitting');
    try {
      setOrder(await orderService.createOrder(cart));
      clearCart();
      setCheckout('idle');
    } catch {
      setCheckout('error');
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
          <h2 id="cart-drawer-title">Shopping Cart</h2>
          <button className="cart-drawer__close" onClick={onClose} aria-label="Close cart">
            ×
          </button>
        </header>

        {order && cart.items.length === 0 && (
          <p className="cart-drawer__empty" role="status">
            Order {order.id} placed. Total {formatPrice(order.total)}.
          </p>
        )}

        {cart.items.length === 0 ? (
          !order && <p className="cart-drawer__empty">Your cart is empty.</p>
        ) : (
          <ul className="cart-drawer__list">
            {cart.items.map((item) => (
              <li key={item.productId} className="cart-drawer__item">
                <div>
                  <p className="cart-drawer__item-name">{item.name}</p>
                  <p className="cart-drawer__item-price">{formatPrice(getItemLineTotal(item))}</p>
                </div>
                <div className="cart-drawer__item-controls">
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    aria-label={`Quantity for ${item.name}`}
                    onChange={(e) => setQuantity(item.productId, Number(e.target.value))}
                  />
                  <button onClick={() => removeProduct(item.productId)}>Remove</button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {checkout === 'error' && (
          <p className="cart-drawer__empty" role="alert">
            Could not place your order. Please try again.
          </p>
        )}

        <footer className="cart-drawer__footer">
          <strong>Total: {formatPrice(total)}</strong>
          <button
            className="cart-drawer__checkout"
            disabled={cart.items.length === 0 || checkout === 'submitting'}
            onClick={handleCheckout}
          >
            {checkout === 'submitting' ? 'Placing order...' : 'Proceed to Payment Gateway'}
          </button>
        </footer>
      </aside>
    </div>
  );
}
