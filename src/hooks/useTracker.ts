import { useCallback } from 'react';
import type { SalahKey } from '../lib/prayer';
import { nextStatus, setPrayerStatus, trackerStore } from '../lib/tracker';

export function useTracker() {
  const log = trackerStore.use();
  const toggle = useCallback((dateKey: string, prayer: SalahKey) => {
    const current = trackerStore.get()[dateKey]?.[prayer];
    setPrayerStatus(dateKey, prayer, nextStatus(current));
    if (navigator.vibrate) {
      try {
        navigator.vibrate(8);
      } catch {
        /* unsupported */
      }
    }
  }, []);
  return { log, toggle };
}
