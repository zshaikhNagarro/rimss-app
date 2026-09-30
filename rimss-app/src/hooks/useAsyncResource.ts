import { useCallback, useEffect, useState } from 'react';

export type AsyncStatus = 'loading' | 'ready' | 'error';

export interface AsyncResource<T> {
  data: T | undefined;
  status: AsyncStatus;
  retry: () => void;
}

/** Runs `load` on mount, when `deps` change or on retry; stale results are discarded. */
export function useAsyncResource<T>(
  load: () => Promise<T>,
  deps: readonly unknown[],
  enabled = true,
): AsyncResource<T> {
  const [data, setData] = useState<T>();
  const [status, setStatus] = useState<AsyncStatus>('loading');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    setStatus('loading');
    load()
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setStatus('ready');
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt, enabled]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { data, status, retry };
}
