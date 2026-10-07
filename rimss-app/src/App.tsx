import { Suspense, useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { trackEvent } from './services/telemetry';
import './modules'; // registers all pluggable functional modules
import { pluginRegistry } from './plugins/PluginRegistry';
import { CartDrawer, CartProvider } from './modules/cart';
import { Header } from './components/Header';
import { Loader } from './components/Loader';
import { ModuleErrorBoundary } from './components/ModuleErrorBoundary';
import { UpdatePrompt } from './components/UpdatePrompt';
import './App.css';

function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const modules = pluginRegistry.getAll();
  const { pathname } = useLocation();

  useEffect(() => trackEvent('page_view', { path: pathname }), [pathname]);

  return (
    <CartProvider>
      <div className="app-shell">
        <Header modules={modules} onCartClick={() => setCartOpen(true)} />

        <main className="app-shell__content">
          <Suspense fallback={<Loader label="Loading module..." />}>
            <Routes>
              {modules.map((m) => (
                <Route
                  key={m.id}
                  path={m.route}
                  element={
                    <ModuleErrorBoundary label={m.navLabel}>
                      <m.component />
                    </ModuleErrorBoundary>
                  }
                />
              ))}
            </Routes>
          </Suspense>
        </main>

        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
        <UpdatePrompt />
      </div>
    </CartProvider>
  );
}

export default App;
