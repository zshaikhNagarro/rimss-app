import { Suspense, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { trackEvent } from './services/telemetry';
import './modules'; // registers all pluggable functional modules
import { pluginRegistry } from './plugins/PluginRegistry';
import { CartDrawer, CartProvider } from './modules/cart';
import { Chatbot } from './components/Chatbot';
import { Header } from './components/Header';
import { Loader } from './components/Loader';
import { ModuleErrorBoundary } from './components/ModuleErrorBoundary';
import { UpdatePrompt } from './components/UpdatePrompt';
import './App.scss';

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
              <Route path="/product" element={<Navigate to="/" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>

        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
        <UpdatePrompt />
        <Chatbot />
      </div>
    </CartProvider>
  );
}

export default App;
