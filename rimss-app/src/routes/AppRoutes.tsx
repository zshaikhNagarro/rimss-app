import { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Loader } from '../components/Loader';
import { ModuleErrorBoundary } from '../components/ModuleErrorBoundary';
import { pluginRegistry } from '../plugins/PluginRegistry';
import { useI18n } from '../i18n';

export function AppRoutes() {
  const { t } = useI18n();
  const modules = pluginRegistry.getAll();

  return (
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
      </Routes>
    </Suspense>
  );
}
