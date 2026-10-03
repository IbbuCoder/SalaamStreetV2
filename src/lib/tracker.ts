import type { SalahKey } from './prayer';
import { createPersistedStore } from './store';

export type PrayerStatus = 'done' | 'missed';
export type DayLog = Partial<Record<SalahKey, PrayerStatus>>;
export type TrackerLog = Record<string, DayLog>; // keyed by YYYY-MM-DD

export const trackerStore = createPersistedStore<TrackerLog>('tracker', {});

export function setPrayerStatus(dateKey: string, prayer: SalahKey, status: PrayerStatus | undefined): void {
  trackerStore.set((log) => {
    const day = { ...(log[dateKey] ?? {}) };
    if (status) day[prayer] = status;
    else delete day[prayer];
    return { ...log, [dateKey]: day };
  });
}

/** Cycle used by the one-tap control: not marked → completed → missed → not marked. */
export function nextStatus(s: PrayerStatus | undefined): PrayerStatus | undefined {
  if (!s) return 'done';
  if (s === 'done') return 'missed';
  return undefined;
}

export function countDone(day: DayLog | undefined): number {
  if (!day) return 0;
  return Object.values(day).filter((s) => s === 'done').length;
}
