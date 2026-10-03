import {
  CalculationMethod,
  Coordinates,
  HighLatitudeRule,
  Madhab,
  PolarCircleResolution,
  PrayerTimes,
  SunnahTimes,
} from 'adhan';
import type { SavedLocation } from './location';
import type { HighLatitudeSetting, MethodKey, PrayerKey, Settings } from './settings';
import { addDays, civilDateIn, type CivilDate } from './time';

export const PRAYER_KEYS: PrayerKey[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
/** The five obligatory prayers (sunrise is a time marker, not a prayer). */
export const SALAH_KEYS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
export type SalahKey = (typeof SALAH_KEYS)[number];

export const PRAYER_LABELS: Record<PrayerKey, string> = {
  fajr: 'Fajr',
  sunrise: 'Sunrise',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

export const PRAYER_ARABIC: Record<PrayerKey, string> = {
  fajr: 'الفجر',
  sunrise: 'الشروق',
  dhuhr: 'الظهر',
  asr: 'العصر',
  maghrib: 'المغرب',
  isha: 'العشاء',
};

export interface MethodInfo {
  key: MethodKey;
  name: string;
  detail: string;
  region: string;
}

export const METHODS: MethodInfo[] = [
  { key: 'MuslimWorldLeague', name: 'Muslim World League', detail: 'Fajr 18°, Isha 17°', region: 'Europe, Far East, parts of the Americas' },
  { key: 'NorthAmerica', name: 'ISNA (North America)', detail: 'Fajr 15°, Isha 15°', region: 'United States, Canada' },
  { key: 'MoonsightingCommittee', name: 'Moonsighting Committee Worldwide', detail: 'Fajr 18°, Isha 18° with seasonal adjustment', region: 'UK and North America' },
  { key: 'Egyptian', name: 'Egyptian General Authority of Survey', detail: 'Fajr 19.5°, Isha 17.5°', region: 'Africa, Syria, Lebanon, Malaysia' },
  { key: 'Karachi', name: 'University of Islamic Sciences, Karachi', detail: 'Fajr 18°, Isha 18°', region: 'Pakistan, India, Bangladesh, Afghanistan' },
  { key: 'UmmAlQura', name: 'Umm al-Qura University, Makkah', detail: 'Fajr 18.5°, Isha 90 min after Maghrib', region: 'Saudi Arabia' },
  { key: 'Dubai', name: 'Dubai', detail: 'Fajr 18.2°, Isha 18.2°', region: 'United Arab Emirates' },
  { key: 'Qatar', name: 'Qatar', detail: 'Fajr 18°, Isha 90 min after Maghrib', region: 'Qatar' },
  { key: 'Kuwait', name: 'Kuwait', detail: 'Fajr 18°, Isha 17.5°', region: 'Kuwait' },
  { key: 'Singapore', name: 'Singapore / Malaysia / Indonesia', detail: 'Fajr 20°, Isha 18°', region: 'Singapore, Malaysia, Indonesia' },
  { key: 'Turkey', name: 'Diyanet (Türkiye)', detail: 'Fajr 18°, Isha 17°', region: 'Türkiye' },
  { key: 'Tehran', name: 'Institute of Geophysics, Tehran', detail: 'Fajr 17.7°, Isha 14°', region: 'Iran' },
];

export function methodInfo(key: MethodKey): MethodInfo {
  return METHODS.find((m) => m.key === key) ?? METHODS[0];
}

/**
 * A sensible default method for a location, based on its time zone. Users can
 * always override this in Settings — local mosques may follow a different convention.
 */
export function recommendedMethod(tz: string): MethodKey {
  const byZone: Record<string, MethodKey> = {
    'Asia/Riyadh': 'UmmAlQura',
    'Asia/Aden': 'UmmAlQura',
    'Asia/Dubai': 'Dubai',
    'Asia/Muscat': 'Dubai',
    'Asia/Qatar': 'Qatar',
    'Asia/Bahrain': 'Qatar',
    'Asia/Kuwait': 'Kuwait',
    'Asia/Karachi': 'Karachi',
    'Asia/Kolkata': 'Karachi',
    'Asia/Calcutta': 'Karachi',
    'Asia/Dhaka': 'Karachi',
    'Asia/Kabul': 'Karachi',
    'Asia/Tehran': 'Tehran',
    'Europe/Istanbul': 'Turkey',
    'Asia/Singapore': 'Singapore',
    'Asia/Kuala_Lumpur': 'Singapore',
    'Asia/Jakarta': 'Singapore',
    'Asia/Makassar': 'Singapore',
    'Asia/Jayapura': 'Singapore',
    'Asia/Brunei': 'Singapore',
    'Africa/Cairo': 'Egyptian',
    'Europe/London': 'MoonsightingCommittee',
  };
  if (byZone[tz]) return byZone[tz];
  if (/^America\/(New_York|Detroit|Chicago|Denver|Los_Angeles|Phoenix|Anchorage|Toronto|Vancouver|Edmonton|Winnipeg|Halifax|Regina|St_Johns|Indiana|Kentucky|Boise)/.test(tz)) {
    return 'NorthAmerica';
  }
  if (/^Africa\//.test(tz)) return 'Egyptian';
  return 'MuslimWorldLeague';
}

export function resolveMethod(settings: Pick<Settings, 'method'>, loc: SavedLocation): MethodKey {
  return settings.method === 'auto' ? recommendedMethod(loc.tz) : settings.method;
}

export interface DaySchedule {
  date: CivilDate;
  times: Record<PrayerKey, Date>;
  /** Midnight (Islamic) and last third of the night, useful for Isha and Qiyam. */
  middleOfNight: Date;
  lastThird: Date;
  method: MethodKey;
}

type CalcSettings = Pick<Settings, 'method' | 'madhab' | 'highLatitude' | 'adjustments'>;

function buildParams(settings: CalcSettings, loc: SavedLocation, coords: Coordinates) {
  const method = resolveMethod(settings, loc);
  const params = CalculationMethod[method]();
  params.madhab = settings.madhab === 'hanafi' ? Madhab.Hanafi : Madhab.Shafi;
  params.highLatitudeRule = resolveHighLatitude(settings.highLatitude, coords);
  params.polarCircleResolution = PolarCircleResolution.AqrabBalad;
  params.adjustments = { ...settings.adjustments };
  return { params, method };
}

function resolveHighLatitude(setting: HighLatitudeSetting, coords: Coordinates) {
  return setting === 'auto' ? HighLatitudeRule.recommended(coords) : setting;
}

/**
 * Calculates prayer times for a civil date at a location. The returned Dates are
 * absolute instants; format them in `loc.tz` for display (DST is handled by Intl).
 */
export function computeDay(loc: SavedLocation, date: CivilDate, settings: CalcSettings): DaySchedule {
  const coords = new Coordinates(loc.lat, loc.lng);
  const { params, method } = buildParams(settings, loc, coords);
  // adhan reads the year/month/day components of this Date; noon avoids DST edges.
  const pt = new PrayerTimes(coords, new Date(date.y, date.m - 1, date.d, 12), params);
  const sunnah = new SunnahTimes(pt);
  return {
    date,
    times: {
      fajr: pt.fajr,
      sunrise: pt.sunrise,
      dhuhr: pt.dhuhr,
      asr: pt.asr,
      maghrib: pt.maghrib,
      isha: pt.isha,
    },
    middleOfNight: sunnah.middleOfTheNight,
    lastThird: sunnah.lastThirdOfTheNight,
    method,
  };
}

export function isScheduleValid(day: DaySchedule): boolean {
  return PRAYER_KEYS.every((k) => day.times[k] instanceof Date && !Number.isNaN(day.times[k].getTime()));
}

export interface PrayerMoment {
  key: SalahKey;
  time: Date;
  /** True when the next prayer is tomorrow's Fajr. */
  tomorrow: boolean;
}

export interface PrayerState {
  today: DaySchedule;
  next: PrayerMoment;
  /** The prayer whose time is currently in, or null (e.g. between sunrise and Dhuhr). */
  current: SalahKey | null;
}

export function prayerState(loc: SavedLocation, now: Date, settings: CalcSettings): PrayerState {
  const todayDate = civilDateIn(now, loc.tz);
  const today = computeDay(loc, todayDate, settings);
  const t = today.times;

  let next: PrayerMoment | null = null;
  for (const key of SALAH_KEYS) {
    if (t[key] > now) {
      next = { key, time: t[key], tomorrow: false };
      break;
    }
  }
  if (!next) {
    const tomorrow = computeDay(loc, addDays(todayDate, 1), settings);
    next = { key: 'fajr', time: tomorrow.times.fajr, tomorrow: true };
  }

  let current: SalahKey | null = null;
  if (now >= t.isha) current = 'isha';
  else if (now >= t.maghrib) current = 'maghrib';
  else if (now >= t.asr) current = 'asr';
  else if (now >= t.dhuhr) current = 'dhuhr';
  else if (now >= t.fajr && now < t.sunrise) current = 'fajr';
  else if (now < t.fajr) current = 'isha'; // still last night's Isha

  return { today, next, current };
}
