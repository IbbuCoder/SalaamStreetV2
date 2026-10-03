import { useMemo } from 'react';
import { prayerState, isScheduleValid, type PrayerState } from '../lib/prayer';
import { useSettings } from '../lib/SettingsContext';
import { civilDateIn, dateKey } from '../lib/time';

export type PrayerStateResult =
  | { status: 'no-location' }
  | { status: 'error'; message: string }
  | { status: 'ok'; state: PrayerState };

/**
 * Prayer state for the saved location. Recomputed once per minute (and whenever
 * settings change); the countdown itself is derived from `now` by the caller.
 */
export function usePrayerState(now: Date): PrayerStateResult {
  const { settings } = useSettings();
  const loc = settings.location;
  const minuteKey = Math.floor(now.getTime() / 60000);
  const dayKey = loc ? dateKey(civilDateIn(now, loc.tz)) : '';

  return useMemo<PrayerStateResult>(() => {
    if (!loc) return { status: 'no-location' };
    try {
      const state = prayerState(loc, new Date(minuteKey * 60000 + 59999), settings);
      if (!isScheduleValid(state.today)) {
        return {
          status: 'error',
          message:
            'Prayer times could not be calculated for this location and date (this can happen at extreme latitudes). Try a different high-latitude rule in Settings.',
        };
      }
      return { status: 'ok', state };
    } catch {
      return { status: 'error', message: 'Prayer times could not be calculated. Please check your location in Settings.' };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loc, minuteKey, dayKey, settings.method, settings.madhab, settings.highLatitude, settings.adjustments]);
}
