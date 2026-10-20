import type { Meta, StoryObj } from '@storybook/react-vite';
import { WishlistModule } from './WishlistModule';
import { wishlist } from './wishlistStore';
import { makeProduct } from '../../test/fixtures';
import { serverError, stubFetch } from '../../../.storybook/mocks/stubFetch';

const img = 'https://placehold.co/400x400';
const products = [
  makeProduct({ id: '1', name: 'Wool Sweater', price: 90, image: img }),
  makeProduct({ id: '2', name: 'Denim Jacket', category: 'Jackets', price: 140, image: img }),
];

const meta = {
  title: 'Modules/Wishlist',
  component: WishlistModule,
} satisfies Meta<typeof WishlistModule>;
export default meta;
type Story = StoryObj<typeof meta>;

const ensureSaved = (ids: string[]) =>
  ids.forEach((id) => {
    if (!wishlist.getSnapshot().includes(id)) wishlist.toggle(id);
  });

export const WithSavedItems: Story = {
  beforeEach: () => {
    ensureSaved(['1', '2']);
    return stubFetch({ '/products': products });
  },
};

export const Empty: Story = {
  beforeEach: () => {
    wishlist.getSnapshot().forEach((id) => wishlist.toggle(id));
    return stubFetch({ '/products': products });
  },
};

export const Failed: Story = {
  beforeEach: () => stubFetch({ '/products': serverError }, 50),
};
