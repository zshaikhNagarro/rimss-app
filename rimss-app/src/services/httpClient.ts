import { track } from './telemetry';

export interface HttpOptions {
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** GET JSON with a timeout and bounded retries (network errors and 5xx only). */
export async function getJson<T>(
  url: string,
  { timeoutMs = 8000, retries = 2, retryDelayMs = 300 }: HttpOptions = {},
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (response.ok) return (await response.json()) as T;
      const error = new Error(`Request failed with status ${response.status}`);
      if (response.status < 500) throw Object.assign(error, { fatal: true });
      lastError = error;
    } catch (e) {
      if ((e as { fatal?: boolean }).fatal) throw e;
      lastError = e;
    } finally {
      clearTimeout(timer);
    }
    if (attempt < retries) {
      track({ type: 'http_retry', message: String(lastError), context: { url, attempt } });
      await sleep(retryDelayMs * 2 ** attempt);
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Request failed');
}

/** POST JSON once with a timeout; never retried because the request is not idempotent. */
export async function postJson<T>(url: string, body: unknown, timeoutMs = 8000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
    return (await response.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}
