import type { Meta, StoryObj } from '@storybook/react-vite';
import { ProductSearchModule } from './ProductSearchModule';
import { makeProduct } from '../../../test/fixtures';
import { serverError, stubFetch } from '../../../../.storybook/mocks/stubFetch';

const img = 'https://placehold.co/400x400';
const products = [
  makeProduct({ id: '1', name: 'Wool Sweater', price: 90, image: img }),
  makeProduct({
    id: '2',
    name: 'Denim Jacket',
    category: 'Jackets',
    color: 'Blue',
    price: 140,
    discountPercent: 20,
    image: img,
  }),
  makeProduct({
    id: '3',
    name: 'Linen Shirt',
    category: 'Shirts',
    color: 'White',
    price: 60,
    inStock: false,
    image: img,
  }),
];

const meta = {
  title: 'Modules/ProductSearch',
  component: ProductSearchModule,
} satisfies Meta<typeof ProductSearchModule>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Loaded: Story = {
  beforeEach: () =>
    stubFetch({
      '/products': products,
      '/categories': ['Sweaters', 'Jackets', 'Shirts'],
      '/colors': ['Blue', 'White'],
    }),
};

export const Loading: Story = {
  beforeEach: () => stubFetch({ '/products': products }, 60_000),
};

export const Empty: Story = {
  beforeEach: () => stubFetch({ '/products': [], '/categories': [], '/colors': [] }),
};

export const Failed: Story = {
  beforeEach: () => stubFetch({ '/': serverError }, 50),
};
