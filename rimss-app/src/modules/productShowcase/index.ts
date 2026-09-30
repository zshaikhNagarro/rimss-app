import { lazy } from 'react';
import { pluginRegistry } from '../../plugins/PluginRegistry';

// Lazy-loaded so its bundle chunk downloads only when a product is opened.
const ProductShowcaseModule = lazy(() =>
  import('./ProductShowcaseModule').then((m) => ({ default: m.ProductShowcaseModule })),
);

pluginRegistry.register({
  id: 'product-showcase',
  navLabel: 'Product',
  route: '/product/:id',
  order: 2,
  hideFromNav: true,
  component: ProductShowcaseModule,
});
