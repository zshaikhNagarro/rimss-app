import type { Meta, StoryObj } from '@storybook/react-vite';
import { AccountModule } from './AccountModule';
import { setSession } from '../../../services/session';
import { serverError, stubFetch } from '../../../../.storybook/mocks/stubFetch';

const line = {
  productId: 'p1',
  name: 'Wool Sweater',
  quantity: 2,
  discountPercent: 0,
  unitPrice: 50,
  lineTotal: 100,
};
const orders = [
  {
    id: 'o1',
    status: 'PENDING_PAYMENT',
    subtotal: 100,
    discountTotal: 0,
    total: 100,
    createdAt: '2026-01-01T10:00:00.000Z',
    lines: [line],
  },
  {
    id: 'o2',
    status: 'PAID',
    subtotal: 100,
    discountTotal: 0,
    total: 100,
    createdAt: '2025-12-01T10:00:00.000Z',
    lines: [line],
  },
];

const meta = {
  title: 'Modules/Account',
  component: AccountModule,
} satisfies Meta<typeof AccountModule>;
export default meta;
type Story = StoryObj<typeof meta>;

export const OrderHistory: Story = {
  beforeEach: () => {
    setSession({ token: 'demo', email: 'shopper@example.com' });
    const restore = stubFetch({ '/orders': orders });
    return () => {
      restore();
      setSession(null);
    };
  },
};

export const NoOrders: Story = {
  beforeEach: () => {
    setSession({ token: 'demo', email: 'shopper@example.com' });
    const restore = stubFetch({ '/orders': [] });
    return () => {
      restore();
      setSession(null);
    };
  },
};

export const OrdersFailed: Story = {
  beforeEach: () => {
    setSession({ token: 'demo', email: 'shopper@example.com' });
    const restore = stubFetch({ '/orders': serverError }, 50);
    return () => {
      restore();
      setSession(null);
    };
  },
};
