import { lazy } from 'react';
import { pluginRegistry } from '../../plugins/PluginRegistry';

const WishlistModule = lazy(() =>
  import('./WishlistModule').then((m) => ({ default: m.WishlistModule })),
);

pluginRegistry.register({
  id: 'wishlist',
  navLabel: 'Wishlist',
  route: '/wishlist',
  order: 4,
  component: WishlistModule,
});

export { useWishlist, wishlist } from './wishlistStore';
