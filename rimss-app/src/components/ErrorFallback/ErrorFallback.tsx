import { Button, Heading } from '../ui';
import './ErrorFallback.scss';

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
      <Heading level={3} align="center">
        {title}
      </Heading>
      <p>{message}</p>
      {onRetry && <Button onClick={onRetry}>{actionLabel}</Button>}
    </div>
  );
}
