import type { ComponentType } from 'react';

// Feature flag: VITE_DISABLED_MODULES=productShowcase,other turns modules off per environment.
const disabledModules = new Set(
  String(import.meta.env.VITE_DISABLED_MODULES ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
);

/**
 * Manifest that every pluggable functional module must provide.
 * The host application never imports feature modules directly -
 * it only depends on this contract, so new modules can be added
 * or removed without touching App shell code.
 */
export interface ModulePlugin {
  id: string;
  navLabel: string;
  route: string;
  /** Lower numbers appear first in the navigation bar. */
  order?: number;
  /** Detail/child routes that shouldn't get their own nav entry. */
  hideFromNav?: boolean;
  component: ComponentType;
}

class PluginRegistry {
  private plugins = new Map<string, ModulePlugin>();

  register(plugin: ModulePlugin): void {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin with id "${plugin.id}" is already registered`);
    }
    this.plugins.set(plugin.id, plugin);
  }

  getAll(): ModulePlugin[] {
    return [...this.plugins.values()]
      .filter((p) => !disabledModules.has(p.id))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }
}

// Singleton shared across the app - modules self-register on import.
export const pluginRegistry = new PluginRegistry();
