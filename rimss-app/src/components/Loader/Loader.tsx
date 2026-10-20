import './Loader.scss';
import { useI18n } from '../../i18n';

export function Loader({ label }: { label?: string }) {
  const { t } = useI18n();
  return (
    <div className="loader" role="status" aria-live="polite">
      <span className="loader__spinner" />
      <span>{label ?? t('common.loading')}</span>
    </div>
  );
}
