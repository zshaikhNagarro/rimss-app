import type { Meta, StoryObj } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';
import { makeProduct } from '../../test/fixtures';
import { ProductGrid } from './ProductGrid';

const image = 'https://placehold.co/400x400';

const meta = {
  title: 'Components/ProductGrid',
  component: ProductGrid,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
  ],
  args: {
    products: [
      makeProduct({ id: 'p1', image }),
      makeProduct({ id: 'p2', name: 'Denim Jacket', discountPercent: 20, image }),
      makeProduct({ id: 'p3', name: 'Linen Shirt', inStock: false, image }),
      makeProduct({ id: 'p4', name: 'Canvas Tote', image }),
    ],
  },
} satisfies Meta<typeof ProductGrid>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Empty: Story = { args: { products: [] } };
