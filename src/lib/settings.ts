import type { SavedLocation } from './location';

export type MethodKey =
  | 'MuslimWorldLeague'
  | 'Egyptian'
  | 'Karachi'
  | 'UmmAlQura'
  | 'Dubai'
  | 'MoonsightingCommittee'
  | 'NorthAmerica'
  | 'Kuwait'
  | 'Qatar'
  | 'Singapore'
  | 'Tehran'
  | 'Turkey';

export type PrayerKey = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
export type HighLatitudeSetting = 'auto' | 'middleofthenight' | 'seventhofthenight' | 'twilightangle';
export type ThemeSetting = 'system' | 'light' | 'dark';
export type TranslationLang = 'en' | 'ur' | 'id' | 'tr' | 'fr' | 'bn' | 'es' | 'none';

export interface Settings {
  location: SavedLocation | null;
  method: 'auto' | MethodKey;
  madhab: 'shafi' | 'hanafi';
  highLatitude: HighLatitudeSetting;
  adjustments: Record<PrayerKey, number>;
  timeFormat: '12h' | '24h';
  hijriOffset: number;
  theme: ThemeSetting;
  quran: {
    translation: TranslationLang;
    transliteration: boolean;
    arabicSize: number; // px
    translationSize: number; // px
  };
  haptics: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  location: null,
  method: 'auto',
  madhab: 'shafi',
  highLatitude: 'auto',
  adjustments: { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
  timeFormat: '12h',
  hijriOffset: 0,
  theme: 'system',
  quran: { translation: 'en', transliteration: false, arabicSize: 30, translationSize: 17 },
  haptics: true,
};

/** Merges stored (possibly older / partial) settings over defaults. */
export function normalizeSettings(raw: unknown): Settings {
  const s = (raw && typeof raw === 'object' ? raw : {}) as Partial<Settings>;
  return {
    ...DEFAULT_SETTINGS,
    ...s,
    adjustments: { ...DEFAULT_SETTINGS.adjustments, ...(s.adjustments ?? {}) },
    quran: { ...DEFAULT_SETTINGS.quran, ...(s.quran ?? {}) },
  };
}

export const TRANSLATIONS: { id: TranslationLang; label: string; author: string; dir: 'ltr' | 'rtl' }[] = [
  { id: 'en', label: 'English', author: 'Saheeh International', dir: 'ltr' },
  { id: 'ur', label: 'اردو · Urdu', author: "Abul A'la Maududi", dir: 'rtl' },
  { id: 'id', label: 'Bahasa Indonesia', author: 'Ministry of Religious Affairs, Indonesia', dir: 'ltr' },
  { id: 'tr', label: 'Türkçe · Turkish', author: 'Diyanet İşleri', dir: 'ltr' },
  { id: 'fr', label: 'Français · French', author: 'Muhammad Hamidullah', dir: 'ltr' },
  { id: 'bn', label: 'বাংলা · Bengali', author: 'Muhiuddin Khan', dir: 'ltr' },
  { id: 'es', label: 'Español · Spanish', author: 'Muhammad Isa García', dir: 'ltr' },
];
