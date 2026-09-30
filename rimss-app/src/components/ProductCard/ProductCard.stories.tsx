import type { Meta, StoryObj } from '@storybook/react-vite';
import { makeProduct } from '../../test/fixtures';
import { ProductCard } from './ProductCard';

const meta = {
  title: 'Components/ProductCard',
  component: ProductCard,
  decorators: [
    (Story) => (
      <div style={{ width: 240 }}>
        <Story />
      </div>
    ),
  ],
  args: { product: makeProduct({ image: 'https://placehold.co/400x400' }) },
} satisfies Meta<typeof ProductCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Discounted: Story = {
  args: { product: makeProduct({ discountPercent: 20, image: 'https://placehold.co/400x400' }) },
};
export const OutOfStock: Story = {
  args: { product: makeProduct({ inStock: false, image: 'https://placehold.co/400x400' }) },
};
export const BrokenImage: Story = {
  args: { product: makeProduct({ image: 'https://invalid.invalid/none.jpg' }) },
};
