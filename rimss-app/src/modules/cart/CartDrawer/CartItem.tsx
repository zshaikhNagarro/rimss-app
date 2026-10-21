import { Button, Input } from '../../../components/ui';
import { useI18n } from '../../../i18n';
import { trackEvent } from '../../../services/telemetry';
import { formatPrice } from '../../../utils/price';
import type { CartItem as CartItemData } from '../../../types/cart';
import { useCart } from '../CartContext';
import { getItemLineTotal } from '../cartLogic';

export function CartItem({ item }: Readonly<{ item: CartItemData }>) {
  const { t } = useI18n();
  const { removeProduct, setQuantity } = useCart();

  return (
    <li className="cart-drawer__item">
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
  );
}
