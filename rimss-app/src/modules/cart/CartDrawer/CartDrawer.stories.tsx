import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { CartProvider, useCart } from '../CartContext';
import { makeProduct } from '../../../test/fixtures';
import { CartDrawer } from './CartDrawer';

function Seed({ count }: { count: number }) {
  const { addProduct } = useCart();
  return (
    <button
      style={{ position: 'fixed', top: 8, left: 8, zIndex: 999 }}
      onClick={() => addProduct(makeProduct({ id: `p${Math.random()}` }), count)}
    >
      Add item
    </button>
  );
}

const meta = {
  title: 'Modules/Cart/CartDrawer',
  component: CartDrawer,
  args: { open: true, onClose: fn() },
  decorators: [
    (Story) => (
      <CartProvider>
        <Seed count={1} />
        <Story />
      </CartProvider>
    ),
  ],
} satisfies Meta<typeof CartDrawer>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};
export const Closed: Story = { args: { open: false } };
