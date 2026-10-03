import { useSyncExternalStore } from 'react';
import { readJSON, storageKey, writeJSON } from './storage';

/**
 * A tiny persisted store shared between components (and synced across tabs).
 * Used for user data like the prayer tracker, bookmarks and tasbih counts.
 */
export function createPersistedStore<T>(key: string, fallback: T) {
  let state: T = readJSON<T>(key, fallback);
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((l) => l());

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (e) => {
      if (e.key === storageKey(key)) {
        state = readJSON<T>(key, fallback);
        emit();
      }
    });
  }

  return {
    get: () => state,
    set(next: T | ((prev: T) => T)) {
      state = typeof next === 'function' ? (next as (p: T) => T)(state) : next;
      writeJSON(key, state);
      emit();
    },
    subscribe(l: () => void) {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    use(): T {
      return useSyncExternalStore(this.subscribe, this.get, this.get);
    },
  };
}
