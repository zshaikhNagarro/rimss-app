import type { Meta, StoryObj } from '@storybook/react-vite';
import { Route, Routes } from 'react-router-dom';
import { ProductShowcaseModule } from './ProductShowcaseModule';
import { CartProvider } from '../../cart/CartContext';
import { makeProduct } from '../../../test/fixtures';
import { serverError, stubFetch } from '../../../../.storybook/mocks/stubFetch';

const product = makeProduct({ discountPercent: 20, image: 'https://placehold.co/600x600' });

const meta = {
  title: 'Modules/ProductShowcase',
  component: ProductShowcaseModule,
  parameters: { initialEntries: ['/product/p1'] },
  decorators: [
    (Story) => (
      <CartProvider>
        <Routes>
          <Route path="/product/:id" element={<Story />} />
        </Routes>
      </CartProvider>
    ),
  ],
} satisfies Meta<typeof ProductShowcaseModule>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Loaded: Story = { beforeEach: () => stubFetch({ '/products/p1': product }) };
export const OutOfStock: Story = {
  beforeEach: () => stubFetch({ '/products/p1': { ...product, inStock: false } }),
};
export const Loading: Story = { beforeEach: () => stubFetch({ '/products/p1': product }, 60_000) };
export const Failed: Story = { beforeEach: () => stubFetch({ '/products/p1': serverError }, 50) };
