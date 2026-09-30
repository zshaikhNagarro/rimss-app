import { Component, type ErrorInfo, type ReactNode } from 'react';
import { track } from '../../services/telemetry';
import { ErrorFallback } from '../ErrorFallback';

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
      <ErrorFallback
        title={`${this.props.label} is temporarily unavailable`}
        onRetry={() => this.setState({ failed: false })}
      />
    );
  }
}
