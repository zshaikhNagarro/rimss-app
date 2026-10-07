import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.tsx';
import { initTelemetry } from './services/telemetry';

initTelemetry(
  import.meta.env.VITE_TELEMETRY_URL ||
    `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api'}/telemetry`,
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
