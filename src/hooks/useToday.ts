import { useMemo } from 'react';
import { toHijri, formatHijri } from '../lib/hijri';
import { useSettings } from '../lib/SettingsContext';
import { civilDateIn, deviceTimeZone, formatGregorian, type CivilDate } from '../lib/time';

/** Today's civil date (in the saved location's zone) with Gregorian and Hijri labels. */
export function useToday(now: Date): { date: CivilDate; tz: string; gregorian: string; hijri: string | null } {
  const { settings } = useSettings();
  const tz = settings.location?.tz ?? deviceTimeZone();
  const date = civilDateIn(now, tz);
  const key = `${date.y}-${date.m}-${date.d}`;
  return useMemo(() => {
    const h = toHijri(date, settings.hijriOffset);
    return { date, tz, gregorian: formatGregorian(date), hijri: h ? formatHijri(h) : null };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, tz, settings.hijriOffset]);
}
