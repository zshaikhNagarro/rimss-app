import './ErrorFallback.css';

interface Props {
  title?: string;
  message?: string;
  onRetry?: () => void;
  actionLabel?: string;
}

export function ErrorFallback({
  title = 'Something went wrong',
  message = 'Please try again.',
  onRetry,
  actionLabel = 'Try again',
}: Props) {
  return (
    <div className="error-fallback" role="alert">
      <h3>{title}</h3>
      <p>{message}</p>
      {onRetry && <button onClick={onRetry}>{actionLabel}</button>}
    </div>
  );
}
