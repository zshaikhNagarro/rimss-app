import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Button, Field, Heading, Input } from '../ui';
import { authService } from '../../services/authService';
import { HttpStatusError } from '../../services/httpClient';
import { trackEvent } from '../../services/telemetry';
import { useI18n, type TFunction } from '../../i18n';
import './AuthDialog.scss';

const authErrorMessage = (e: unknown, t: TFunction): string => {
  const status = e instanceof HttpStatusError ? e.status : 0;
  if (status === 401) return t('account.err401');
  if (status === 409) return t('account.err409');
  if (status === 400) return t('account.err400');
  if (status === 429) return t('account.err429');
  return t('account.errGeneric');
};

/** Sign-in / register modal; calls onSuccess after a session is established. */
export function AuthDialog({
  open,
  onClose,
  onSuccess,
}: Readonly<{ open: boolean; onClose: () => void; onSuccess?: () => void }>) {
  const { t } = useI18n();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(undefined);
    try {
      await authService[mode](email, password);
      trackEvent(mode === 'login' ? 'login' : 'sign_up');
      setPassword('');
      onSuccess?.();
      onClose();
    } catch (err) {
      trackEvent(mode === 'login' ? 'login_failed' : 'sign_up_failed');
      setError(authErrorMessage(err, t));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-dialog-backdrop" onClick={onClose}>
      <form
        className="auth-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-dialog-title"
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
      >
        <header className="auth-dialog__header">
          <Heading level={2} size="lg" id="auth-dialog-title">
            {mode === 'login' ? t('account.signIn') : t('account.createAccount')}
          </Heading>
          <Button variant="icon" onClick={onClose} aria-label={t('common.close')}>
            &times;
          </Button>
        </header>
        <Field>
          {t('account.email')}
          <Input
            autoFocus
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field>
          {t('account.password')}
          <Input
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            minLength={8}
            maxLength={72}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        {error && (
          <p className="auth-dialog__error" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" disabled={busy}>
          {mode === 'login' ? t('account.signIn') : t('account.register')}
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login');
            setError(undefined);
          }}
        >
          {mode === 'login' ? t('account.needAccount') : t('account.haveAccount')}
        </Button>
      </form>
    </div>
  );
}
