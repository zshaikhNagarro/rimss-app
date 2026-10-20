import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { ErrorFallback } from '../../../components/ErrorFallback';
import { Button, Card, Heading } from '../../../components/ui';
import { useAsyncResource } from '../../../hooks/useAsyncResource';
import { authService } from '../../../services/authService';
import { orderService } from '../../../services/orderService';
import { useSession } from '../../../services/session';
import type { Order } from '../../../types/order';
import { formatPrice } from '../../../utils/price';
import './AccountModule.scss';
import { useI18n } from '../../../i18n';

function OrderHistory({ email }: Readonly<{ email: string }>) {
  const { t } = useI18n();
  const { data, status, retry } = useAsyncResource(() => orderService.listOrders(), []);
  const [updated, setUpdated] = useState<Record<string, Order>>({});
  const [busyId, setBusyId] = useState<string>();
  const [actionError, setActionError] = useState(false);

  const act = async (id: string, action: 'pay' | 'cancel') => {
    setBusyId(id);
    setActionError(false);
    try {
      const order = await orderService[action](id);
      setUpdated((u) => ({ ...u, [id]: order }));
    } catch {
      setActionError(true);
    } finally {
      setBusyId(undefined);
    }
  };

  const orders = (data ?? []).map((o) => updated[o.id] ?? o);
  const spent = orders.filter((o) => o.status === 'PAID').reduce((s, o) => s + o.total, 0);
  const pending = orders.filter((o) => o.status === 'PENDING_PAYMENT').length;
  const stats = [
    { label: t('account.statOrders'), value: String(orders.length) },
    { label: t('account.statPending'), value: String(pending) },
    { label: t('account.statSpent'), value: formatPrice(spent) },
  ];

  return (
    <section className="account">
      <Card
        as="section"
        padding="md"
        className="account__profile"
        aria-label={t('account.profile')}
      >
        <span className="account__avatar" aria-hidden="true">
          {email.charAt(0).toUpperCase()}
        </span>
        <div className="account__identity">
          <Heading level={1} size="lg">
            {t('account.myAccount')}
          </Heading>
          <p className="account__email">{email}</p>
        </div>
        <Button variant="outline" size="sm" onClick={authService.logout}>
          {t('account.signOut')}
        </Button>
        {status === 'ready' && (
          <dl className="account__stats">
            {stats.map((s) => (
              <div key={s.label} className="account__stat">
                <dt>{s.label}</dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </Card>

      <Heading level={2} className="account__section-title">
        {t('account.myOrders')}
      </Heading>

      {status === 'loading' && <p role="status">{t('account.loadingOrders')}</p>}
      {status === 'error' && (
        <ErrorFallback
          title={t('account.ordersError')}
          message={t('account.ordersErrorHint')}
          onRetry={retry}
        />
      )}
      {status === 'ready' && data?.length === 0 && (
        <Card padding="md" className="account__empty">
          {t('account.noOrders')}
        </Card>
      )}
      {actionError && (
        <p className="account__error" role="alert">
          {t('account.actionError')}
        </p>
      )}

      <ul className="account__orders">
        {orders.map((order) => (
          <li key={order.id}>
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
                    <Button
                      size="sm"
                      disabled={busyId === order.id}
                      onClick={() => act(order.id, 'pay')}
                    >
                      {t('account.pay')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={busyId === order.id}
                      onClick={() => act(order.id, 'cancel')}
                    >
                      {t('account.cancel')}
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function AccountModule() {
  const session = useSession();
  // Account is only reachable while signed in; sign-in happens in the header dialog.
  if (!session) return <Navigate to="/" replace />;
  return <OrderHistory key={session.token} email={session.email} />;
}
