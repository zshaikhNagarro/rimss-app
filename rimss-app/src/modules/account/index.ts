import { lazy } from 'react';
import { pluginRegistry } from '../../plugins/PluginRegistry';

const AccountModule = lazy(() =>
  import('./AccountModule').then((m) => ({ default: m.AccountModule })),
);

pluginRegistry.register({
  id: 'account',
  navLabel: 'Account',
  route: '/account',
  order: 5,
  requiresAuth: true,
  component: AccountModule,
});
