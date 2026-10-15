import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import { CartProvider } from '../../modules/cart';
import { Header } from './Header';

const Stub = () => null;

const meta = {
  title: 'Components/Header',
  component: Header,
  decorators: [
    (Story) => (
      <CartProvider>
        <Story />
      </CartProvider>
    ),
  ],
  args: {
    onCartClick: fn(),
    modules: [
      { id: 'shop', navLabel: 'Shop', route: '/', component: Stub },
      { id: 'about', navLabel: 'About', route: '/about', component: Stub },
    ],
  },
} satisfies Meta<typeof Header>;
export default meta;

export const Default: StoryObj<typeof meta> = {};
