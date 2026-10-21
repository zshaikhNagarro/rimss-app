import { Button, Card } from '../../../components/ui';
import { useI18n } from '../../../i18n';
import type { Order } from '../../../types/order';
import { formatPrice } from '../../../utils/price';

export function OrderCard({
  order,
  busy,
  onAct,
}: Readonly<{
  order: Order;
  busy: boolean;
  onAct: (id: string, action: 'pay' | 'cancel') => void;
}>) {
  const { t } = useI18n();

  return (
    <Card padding="md" className="account__order">
      <div className="account__order-top">
        <div>
          <p className="account__order-id">
            {t('account.orderNumber', { id: order.id.slice(0, 8) })}
          </p>
          <p className="account__meta">
            {new Date(order.createdAt).toLocaleString()} &middot;{' '}
            {t(order.lines.length === 1 ? 'account.itemOne' : 'account.itemMany', {
              count: order.lines.length,
            })}
          </p>
        </div>
        <span className={`account__status account__status--${order.status}`}>
          {t(`account.status.${order.status}`, undefined, order.status)}
        </span>
      </div>
      <ul className="account__lines">
        {order.lines.map((l) => (
          <li key={l.productId}>
            <span>
              {l.quantity} x {l.name}
            </span>
            <span>{formatPrice(l.lineTotal)}</span>
          </li>
        ))}
      </ul>
      <div className="account__order-bottom">
        <strong className="account__total">{formatPrice(order.total)}</strong>
        {order.status === 'PENDING_PAYMENT' && (
          <div className="account__actions">
            <Button size="sm" disabled={busy} onClick={() => onAct(order.id, 'pay')}>
              {t('account.pay')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => onAct(order.id, 'cancel')}
            >
              {t('account.cancel')}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
