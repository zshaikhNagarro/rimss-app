import { getSession, setSession } from './session';
import { track } from './telemetry';

/** Error thrown for non-2xx responses so callers can branch on `status` and the API `code`. */
export class HttpStatusError extends Error {
  status: number;
  code?: string;
  constructor(status: number, code?: string) {
    super(`Request failed with status ${status}`);
    this.status = status;
    this.code = code;
  }
}

async function toError(response: Response): Promise<HttpStatusError> {
  // An expired cookie shows up as 401 on a request made while we think we are signed in.
  if (response.status === 401 && getSession()) setSession(null);
  const body = await response.json().catch(() => undefined);
  return new HttpStatusError(response.status, body?.error?.code);
}

export interface HttpOptions {
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** GET JSON with a timeout and bounded retries (network errors and 5xx only). */
export async function getJson<T>(url: string, options: HttpOptions = {}): Promise<T> {
  return (await getJsonWithHeaders<T>(url, options)).data;
}

/** Same as getJson but also returns the response headers (e.g. X-Total-Count). */
export async function getJsonWithHeaders<T>(
  url: string,
  { timeoutMs = 8000, retries = 2, retryDelayMs = 300 }: HttpOptions = {},
): Promise<{ data: T; headers: Headers }> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { signal: controller.signal, credentials: 'include' });
      if (response.ok) return { data: (await response.json()) as T, headers: response.headers };
      const error = await toError(response);
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
      credentials: 'include',
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!response.ok) throw await toError(response);
    return (await response.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}
