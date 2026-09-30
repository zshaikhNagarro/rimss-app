import { afterEach, describe, expect, it, vi } from 'vitest';

const Stub = () => null;
const load = async () => (await import('./PluginRegistry')).pluginRegistry;

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('PluginRegistry', () => {
  it('sorts plugins by order', async () => {
    vi.resetModules();
    const registry = await load();
    registry.register({ id: 'b', navLabel: 'B', route: '/b', order: 2, component: Stub });
    registry.register({ id: 'a', navLabel: 'A', route: '/a', order: 1, component: Stub });
    expect(registry.getAll().map((p) => p.id)).toEqual(['a', 'b']);
  });

  it('rejects duplicate ids', async () => {
    vi.resetModules();
    const registry = await load();
    registry.register({ id: 'a', navLabel: 'A', route: '/a', component: Stub });
    expect(() =>
      registry.register({ id: 'a', navLabel: 'A', route: '/a', component: Stub }),
    ).toThrow('already registered');
  });

  it('hides modules listed in VITE_DISABLED_MODULES', async () => {
    vi.stubEnv('VITE_DISABLED_MODULES', ' b , c');
    vi.resetModules();
    const registry = await load();
    registry.register({ id: 'a', navLabel: 'A', route: '/a', component: Stub });
    registry.register({ id: 'b', navLabel: 'B', route: '/b', component: Stub });
    expect(registry.getAll().map((p) => p.id)).toEqual(['a']);
  });
});
