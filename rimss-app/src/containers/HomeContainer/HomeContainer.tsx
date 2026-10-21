import { lazy, useRef, useState } from 'react';
import { AppRoutes } from '../../routes';
import { Deferred } from '../../components/Deferred';
import { Header } from '../../components/Header';
import { useRouteEffects } from '../../hooks/useRouteEffects';
import { useI18n } from '../../i18n';
import { pluginRegistry } from '../../plugins/PluginRegistry';

// Non-critical UI is split out of the entry bundle.
const Footer = lazy(() => import('../../components/Footer').then((m) => ({ default: m.Footer })));
const CartDrawer = lazy(() =>
  import('../../modules/cart/CartDrawer').then((m) => ({ default: m.CartDrawer })),
);
const ConsentBanner = lazy(() =>
  import('../../components/ConsentBanner').then((m) => ({ default: m.ConsentBanner })),
);
const UpdatePrompt = lazy(() =>
  import('../../components/UpdatePrompt').then((m) => ({ default: m.UpdatePrompt })),
);
const Chatbot = lazy(() =>
  import('../../components/Chatbot').then((m) => ({ default: m.Chatbot })),
);
const AuthDialog = lazy(() =>
  import('../../components/AuthDialog').then((m) => ({ default: m.AuthDialog })),
);

/** Page shell: header, routed content, footer and the cart/auth/chat overlays. */
export function HomeContainer() {
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  // Signing in from the cart reopens it afterwards.
  const [resumeCart, setResumeCart] = useState(false);
  const modules = pluginRegistry.getAll();
  const { t } = useI18n();
  const mainRef = useRef<HTMLElement>(null);

  useRouteEffects(modules, mainRef);

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
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        {t('app.skip')}
      </a>
      <Header
        modules={modules}
        onCartClick={() => setCartOpen(true)}
        onSignInClick={() => setAuthOpen(true)}
      />

      <main id="main-content" ref={mainRef} tabIndex={-1} className="app-shell__content">
        <AppRoutes />
      </main>

      <Deferred label="Footer">
        <Footer />
      </Deferred>
      <Deferred label="Cart">
        <CartDrawer
          open={cartOpen}
          onClose={() => setCartOpen(false)}
          onSignIn={signInForCheckout}
        />
      </Deferred>
      {/* Mounted only while open so each visit starts on the sign-in form. */}
      {authOpen && (
        <Deferred label="Sign in">
          <AuthDialog open onClose={closeAuth} onSuccess={() => resumeCart && setCartOpen(true)} />
        </Deferred>
      )}
      <Deferred label="Update prompt">
        <UpdatePrompt />
      </Deferred>
      <Deferred label="Consent">
        <ConsentBanner />
      </Deferred>
      <Deferred label="Chatbot">
        <Chatbot />
      </Deferred>
    </div>
  );
}
