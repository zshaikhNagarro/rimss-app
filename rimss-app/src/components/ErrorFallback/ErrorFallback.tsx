import { Button, Heading } from '../ui';
import { useI18n } from '../../i18n';
import './ErrorFallback.scss';

interface Props {
  title?: string;
  message?: string;
  onRetry?: () => void;
  actionLabel?: string;
}

export function ErrorFallback({ title, message, onRetry, actionLabel }: Props) {
  const { t } = useI18n();
  return (
    <div className="error-fallback" role="alert">
      <Heading level={3} align="center">
        {title ?? t('common.somethingWrong')}
      </Heading>
      <p>{message ?? t('common.pleaseTryAgain')}</p>
      {onRetry && <Button onClick={onRetry}>{actionLabel ?? t('common.tryAgain')}</Button>}
    </div>
  );
}
