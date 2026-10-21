import { pluginRegistry } from '../../plugins/PluginRegistry';
import { OffersBanner } from './OffersBanner';

// Plugs into the home page's "home-top" slot; disable with VITE_DISABLED_MODULES=offers.
pluginRegistry.registerWidget({
  id: 'offers',
  slot: 'home-top',
  order: 1,
  component: OffersBanner,
});
