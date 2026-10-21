import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { pluginRegistry } from '../plugins/PluginRegistry';
import { AppRoutes } from './AppRoutes';

function Home() {
  return <p>home page</p>;
}
function Boom(): never {
  throw new Error('boom');
}

pluginRegistry.register({ id: 'test-home', navLabel: 'Home', route: '/', component: Home });
pluginRegistry.register({ id: 'test-boom', navLabel: 'Broken', route: '/boom', component: Boom });

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  );

describe('AppRoutes', () => {
  it('renders the module registered for the route', async () => {
    renderAt('/');
    expect(await screen.findByText('home page')).toBeInTheDocument();
  });

  it('redirects unknown paths to the home route', async () => {
    renderAt('/does-not-exist');
    expect(await screen.findByText('home page')).toBeInTheDocument();
  });

  it('redirects the bare /product path to home', async () => {
    renderAt('/product');
    expect(await screen.findByText('home page')).toBeInTheDocument();
  });

  it('contains a crashing module behind its own fallback', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    renderAt('/boom');
    expect(await screen.findByRole('alert')).toHaveTextContent('Broken is temporarily unavailable');
    spy.mockRestore();
  });
});
