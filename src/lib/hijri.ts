// Hijri dates via the Umm al-Qura calendar built into the browser (Intl / ICU).
// Actual month starts can differ locally by a day depending on moon sighting,
// so users can apply a ±day offset in Settings.
import { addDays, civilToUTCNoon, type CivilDate } from './time';

export interface HijriDate {
  y: number;
  m: number; // 1-12
  d: number;
}

export const HIJRI_MONTHS = [
  'Muharram',
  'Safar',
  'Rabi al-Awwal',
  'Rabi al-Thani',
  'Jumada al-Ula',
  'Jumada al-Akhirah',
  'Rajab',
  "Sha'ban",
  'Ramadan',
  'Shawwal',
  "Dhu al-Qa'dah",
  'Dhu al-Hijjah',
];

export const HIJRI_MONTHS_AR = [
  'مُحَرَّم',
  'صَفَر',
  'رَبِيع الأَوَّل',
  'رَبِيع الآخِر',
  'جُمَادَى الأُولَى',
  'جُمَادَى الآخِرَة',
  'رَجَب',
  'شَعْبَان',
  'رَمَضَان',
  'شَوَّال',
  'ذُو القَعْدَة',
  'ذُو الحِجَّة',
];

let formatter: Intl.DateTimeFormat | null = null;
let supported: boolean | null = null;

function getFormatter(): Intl.DateTimeFormat | null {
  if (supported === false) return null;
  if (!formatter) {
    try {
      formatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura-nu-latn', {
        timeZone: 'UTC',
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
      });
      supported = formatter.resolvedOptions().calendar === 'islamic-umalqura';
      if (!supported) formatter = null;
    } catch {
      supported = false;
      formatter = null;
    }
  }
  return formatter;
}

export function hijriSupported(): boolean {
  return getFormatter() !== null;
}

const cache = new Map<string, HijriDate>();

/** Converts a civil (Gregorian) date to Hijri, applying the user's day offset. */
export function toHijri(c: CivilDate, offset = 0): HijriDate | null {
  const f = getFormatter();
  if (!f) return null;
  const shifted = offset ? addDays(c, offset) : c;
  const key = `${shifted.y}-${shifted.m}-${shifted.d}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const parts = f.formatToParts(civilToUTCNoon(shifted));
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const h = { y: get('year') || get('relatedYear'), m: get('month'), d: get('day') };
  if (!h.y || !h.m || !h.d) return null;
  cache.set(key, h);
  return h;
}

export function formatHijri(h: HijriDate): string {
  return `${h.d} ${HIJRI_MONTHS[h.m - 1]} ${h.y} AH`;
}

export interface HijriMonthDay {
  hijri: HijriDate;
  date: CivilDate;
}

/** All days of the Hijri month containing `c`, with their Gregorian dates. */
export function hijriMonthOf(c: CivilDate, offset = 0): HijriMonthDay[] | null {
  const h = toHijri(c, offset);
  if (!h) return null;
  const start = addDays(c, -(h.d - 1));
  const days: HijriMonthDay[] = [];
  for (let i = 0; i < 31; i++) {
    const date = addDays(start, i);
    const hd = toHijri(date, offset);
    if (!hd || hd.m !== h.m) break;
    days.push({ hijri: hd, date });
  }
  return days;
}

/** Finds the next Gregorian date (on or after `from`) for a given Hijri month/day. */
export function nextOccurrence(from: CivilDate, month: number, day: number, offset = 0, horizon = 400): CivilDate | null {
  for (let i = 0; i <= horizon; i++) {
    const c = addDays(from, i);
    const h = toHijri(c, offset);
    if (h && h.m === month && h.d === day) return c;
  }
  return null;
}
