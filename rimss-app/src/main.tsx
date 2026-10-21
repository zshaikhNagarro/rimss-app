import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.scss';
import App from './App.tsx';
import { applyTheme, getInitialTheme } from './hooks/useTheme';
import { I18nProvider } from './i18n';
import { getConsent, GA_ID, initAnalytics } from './services/analytics';
import { initTelemetry } from './services/telemetry';
import { reportWebVitals } from './services/webVitals';

applyTheme(getInitialTheme());

initTelemetry(
  import.meta.env.VITE_TELEMETRY_URL ||
    `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api'}/telemetry`,
);
if (getConsent() === 'granted') initAnalytics(GA_ID);
reportWebVitals();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <I18nProvider>
        <App />
      </I18nProvider>
    </BrowserRouter>
  </StrictMode>,
);
