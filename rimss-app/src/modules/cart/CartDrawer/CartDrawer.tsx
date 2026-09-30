import { useCart } from '../CartContext';
import { getItemLineTotal } from '../cartLogic';
import './CartDrawer.css';

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { cart, total, removeProduct, setQuantity } = useCart();

  if (!open) return null;

  return (
    <div className="cart-drawer-backdrop" onClick={onClose}>
      <aside className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <header className="cart-drawer__header">
          <h2>Shopping Cart</h2>
          <button className="cart-drawer__close" onClick={onClose} aria-label="Close cart">
            ×
          </button>
        </header>

        {cart.items.length === 0 ? (
          <p className="cart-drawer__empty">Your cart is empty.</p>
        ) : (
          <ul className="cart-drawer__list">
            {cart.items.map((item) => (
              <li key={item.productId} className="cart-drawer__item">
                <div>
                  <p className="cart-drawer__item-name">{item.name}</p>
                  <p className="cart-drawer__item-price">${getItemLineTotal(item).toFixed(2)}</p>
                </div>
                <div className="cart-drawer__item-controls">
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => setQuantity(item.productId, Number(e.target.value))}
                  />
                  <button onClick={() => removeProduct(item.productId)}>Remove</button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <footer className="cart-drawer__footer">
          <strong>Total: ${total.toFixed(2)}</strong>
          <button className="cart-drawer__checkout" disabled={cart.items.length === 0}>
            Proceed to Payment Gateway
          </button>
        </footer>
      </aside>
    </div>
  );
}
