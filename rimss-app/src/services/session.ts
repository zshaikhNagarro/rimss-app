import { useSyncExternalStore } from 'react';

const TOKEN_KEY = 'rimss.auth.v1';

export interface Session {
  email: string;
}

const listeners = new Set<() => void>();
let session: Session | null = read();

// The auth token lives in an httpOnly cookie; only the email is kept here to render the UI.
function read(): Session | null {
  try {
    const raw = sessionStorage.getItem(TOKEN_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return typeof parsed?.email === 'string' ? { email: parsed.email } : null;
  } catch {
    return null;
  }
}

export function setSession(next: Session | null) {
  session = next;
  try {
    if (next) sessionStorage.setItem(TOKEN_KEY, JSON.stringify(next));
    else sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // Storage unavailable: the session just lasts until reload.
  }
  listeners.forEach((l) => l());
}

export const getSession = () => session;

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const useSession = (): Session | null => useSyncExternalStore(subscribe, getSession);
