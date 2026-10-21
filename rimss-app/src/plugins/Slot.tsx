import { pluginRegistry } from './PluginRegistry';
import { ModuleErrorBoundary } from '../components/ModuleErrorBoundary';

/** Renders every widget plugged into a slot, each isolated by its own error boundary. */
export function Slot({ name }: Readonly<{ name: string }>) {
  return (
    <>
      {pluginRegistry.getWidgets(name).map((w) => (
        <ModuleErrorBoundary key={w.id} label={w.id}>
          <w.component />
        </ModuleErrorBoundary>
      ))}
    </>
  );
}
