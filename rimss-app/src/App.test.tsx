import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeProduct } from './test/fixtures';

const svc = vi.hoisted(() => ({ getAll: vi.fn(), getById: vi.fn() }));
vi.mock('./services/productService', () => ({ productService: svc }));
vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({
    offlineReady: [false, vi.fn()],
    needRefresh: [false, vi.fn()],
    updateServiceWorker: vi.fn(),
  }),
}));

import App from './App';
import { pluginRegistry } from './plugins/PluginRegistry';

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );

beforeEach(() => vi.resetAllMocks());

describe('App', () => {
  it('registers the search and showcase modules', () => {
    expect(pluginRegistry.getAll().length).toBeGreaterThanOrEqual(2);
  });

  it('renders every module route inside the shell', async () => {
    svc.getAll.mockResolvedValue([makeProduct()]);
    svc.getById.mockResolvedValue(makeProduct());
    for (const m of pluginRegistry.getAll()) {
      const { unmount } = renderAt(m.route.replace(/:\w+\??/g, 'p1'));
      expect(await screen.findByRole('main')).toBeInTheDocument();
      unmount();
    }
  });
});
