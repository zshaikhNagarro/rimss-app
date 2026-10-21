import { Suspense, type ReactNode } from 'react';
import { ModuleErrorBoundary } from '../ModuleErrorBoundary';

/** A chunk that fails to load must not take down the shell, so each is isolated. */
export function Deferred({ label, children }: Readonly<{ label: string; children: ReactNode }>) {
  return (
    <ModuleErrorBoundary label={label}>
      <Suspense fallback={null}>{children}</Suspense>
    </ModuleErrorBoundary>
  );
}
