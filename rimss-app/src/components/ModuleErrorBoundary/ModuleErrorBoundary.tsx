import { Component, type ErrorInfo, type ReactNode } from 'react';
import { track } from '../../services/telemetry';
import { ErrorFallback } from '../ErrorFallback';
import { useI18n } from '../../i18n';

function Unavailable({ label, onRetry }: Readonly<{ label: string; onRetry: () => void }>) {
  const { t } = useI18n();
  return <ErrorFallback title={t('module.unavailable', { label })} onRetry={onRetry} />;
}

interface Props {
  label: string;
  children: ReactNode;
}

/** Isolates a failing functional module so the rest of the shell keeps working. */
export class ModuleErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`Module "${this.props.label}" crashed`, error, info.componentStack);
    track({
      type: 'error',
      message: error.message,
      context: {
        module: this.props.label,
        route: window.location.pathname,
        stack: info.componentStack,
      },
    });
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <Unavailable label={this.props.label} onRetry={() => this.setState({ failed: false })} />
    );
  }
}
