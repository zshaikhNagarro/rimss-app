import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProductCardSkeleton, ProductDetailSkeleton, ProductGridSkeleton } from './Skeleton';

const meta = { title: 'Components/Skeleton' } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Card: Story = {
  render: () => (
    <div style={{ width: 240 }}>
      <ProductCardSkeleton />
    </div>
  ),
};
export const Grid: Story = { render: () => <ProductGridSkeleton count={6} /> };
export const Detail: Story = { render: () => <ProductDetailSkeleton /> };
