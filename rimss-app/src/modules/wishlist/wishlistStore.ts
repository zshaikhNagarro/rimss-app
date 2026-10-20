import { useSyncExternalStore } from 'react';

const KEY = 'rimss.wishlist.v1';
const listeners = new Set<() => void>();

function load(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((i): i is string => typeof i === 'string') : [];
  } catch {
    return [];
  }
}

// Replaced (never mutated) on change so useSyncExternalStore sees a new snapshot.
let ids = load();

function save(next: string[]) {
  ids = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Quota or private-mode errors must not break browsing.
  }
  listeners.forEach((l) => l());
}

export const wishlist = {
  toggle: (id: string) => save(ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]),
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: () => ids,
};

export const useWishlist = (): string[] =>
  useSyncExternalStore(wishlist.subscribe, wishlist.getSnapshot);
