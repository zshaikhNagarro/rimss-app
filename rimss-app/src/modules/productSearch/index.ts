import { lazy } from 'react';
import { pluginRegistry } from '../../plugins/PluginRegistry';

// Lazy-loaded so its bundle chunk downloads only when the Shop route is visited.
const ProductSearchModule = lazy(() =>
  import('./ProductSearchModule').then((m) => ({ default: m.ProductSearchModule })),
);

// Self-registration: the host application never imports this module by
// name, it only needs to import this file once (see modules/index.ts).
pluginRegistry.register({
  id: 'product-search',
  navLabel: 'Shop',
  route: '/',
  order: 1,
  component: ProductSearchModule,
});
