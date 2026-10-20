import { useSyncExternalStore } from 'react';

const TOKEN_KEY = 'rimss.auth.v1';

export interface Session {
  token: string;
  email: string;
}

const listeners = new Set<() => void>();
let session: Session | null = read();

function read(): Session | null {
  try {
    // sessionStorage limits token lifetime to the tab; the API token also expires after 1 h.
    const raw = sessionStorage.getItem(TOKEN_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return typeof parsed?.token === 'string' && typeof parsed?.email === 'string' ? parsed : null;
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
export const getToken = () => session?.token;

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export const useSession = (): Session | null => useSyncExternalStore(subscribe, getSession);
