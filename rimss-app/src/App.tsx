import { Suspense, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { trackEvent } from './services/telemetry';
import './modules'; // registers all pluggable functional modules
import { pluginRegistry } from './plugins/PluginRegistry';
import { CartDrawer, CartProvider } from './modules/cart';
import { Chatbot } from './components/Chatbot';
import { AuthDialog } from './components/AuthDialog';
import { Header } from './components/Header';
import { Loader } from './components/Loader';
import { ModuleErrorBoundary } from './components/ModuleErrorBoundary';
import { UpdatePrompt } from './components/UpdatePrompt';
import { useI18n } from './i18n';
import './App.scss';

function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  // Signing in from the cart reopens it afterwards.
  const [resumeCart, setResumeCart] = useState(false);
  const modules = pluginRegistry.getAll();
  const { pathname } = useLocation();
  const { t } = useI18n();

  useEffect(() => trackEvent('page_view', { path: pathname }), [pathname]);

  const signInForCheckout = () => {
    setCartOpen(false);
    setResumeCart(true);
    setAuthOpen(true);
  };
  const closeAuth = () => {
    setAuthOpen(false);
    setResumeCart(false);
  };

  return (
    <CartProvider>
      <div className="app-shell">
        <Header
          modules={modules}
          onCartClick={() => setCartOpen(true)}
          onSignInClick={() => setAuthOpen(true)}
        />

        <main className="app-shell__content">
          <Suspense fallback={<Loader label={t('module.loading')} />}>
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

        <CartDrawer
          open={cartOpen}
          onClose={() => setCartOpen(false)}
          onSignIn={signInForCheckout}
        />
        {/* Mounted only while open so each visit starts on the sign-in form. */}
        {authOpen && (
          <AuthDialog open onClose={closeAuth} onSuccess={() => resumeCart && setCartOpen(true)} />
        )}
        <UpdatePrompt />
        <Chatbot />
      </div>
    </CartProvider>
  );
}

export default App;
