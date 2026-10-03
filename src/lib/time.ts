// Time helpers. Prayer times are always displayed in the *location's* time zone,
// which may differ from the device time zone (e.g. a manually chosen city).

export interface CivilDate {
  y: number;
  m: number; // 1-12
  d: number;
}

const partsCache = new Map<string, Intl.DateTimeFormat>();

function ymdFormatter(tz: string) {
  let f = partsCache.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
    partsCache.set(tz, f);
  }
  return f;
}

/** The calendar date at `instant` in time zone `tz`. */
export function civilDateIn(instant: Date, tz: string): CivilDate {
  const parts = ymdFormatter(tz).formatToParts(instant);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return { y: get('year'), m: get('month'), d: get('day') };
}

export function addDays(c: CivilDate, days: number): CivilDate {
  const dt = new Date(Date.UTC(c.y, c.m - 1, c.d + days, 12));
  return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() };
}

/** A UTC-noon Date representing a civil date; safe from DST edge cases. */
export function civilToUTCNoon(c: CivilDate): Date {
  return new Date(Date.UTC(c.y, c.m - 1, c.d, 12));
}

export function dateKey(c: CivilDate): string {
  return `${c.y}-${String(c.m).padStart(2, '0')}-${String(c.d).padStart(2, '0')}`;
}

export function parseDateKey(key: string): CivilDate {
  const [y, m, d] = key.split('-').map(Number);
  return { y, m, d };
}

export function isValidTimeZone(tz: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

export function deviceTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

const timeFmtCache = new Map<string, Intl.DateTimeFormat>();

export function formatTime(instant: Date, tz: string, format: '12h' | '24h'): string {
  const key = `${tz}|${format}`;
  let f = timeFmtCache.get(key);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: 'numeric',
      minute: '2-digit',
      hourCycle: format === '12h' ? 'h12' : 'h23',
    });
    timeFmtCache.set(key, f);
  }
  return f.format(instant);
}

/** "2h 14m", "14m", "45s" */
export function formatDuration(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${totalSec % 60}s`;
}

/** Spoken-friendly version for screen readers: "2 hours 14 minutes". */
export function formatDurationLong(ms: number): string {
  const totalMin = Math.max(0, Math.round(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  const parts = [];
  if (h) parts.push(`${h} hour${h === 1 ? '' : 's'}`);
  if (m || !h) parts.push(`${m} minute${m === 1 ? '' : 's'}`);
  return parts.join(' ');
}

export function formatGregorian(c: CivilDate, style: 'long' | 'short' = 'long'): string {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'UTC',
    weekday: style === 'long' ? 'long' : 'short',
    day: 'numeric',
    month: style === 'long' ? 'long' : 'short',
    year: 'numeric',
  }).format(civilToUTCNoon(c));
}

export function formatUtcOffset(instant: Date, tz: string): string {
  try {
    const p = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'shortOffset' })
      .formatToParts(instant)
      .find((x) => x.type === 'timeZoneName');
    return p?.value ?? '';
  } catch {
    return '';
  }
}
