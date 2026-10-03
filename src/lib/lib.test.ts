import { describe, expect, it } from 'vitest';
import surahs from '../../public/data/quran/surahs.json';
import { computeDay, prayerState, recommendedMethod } from './prayer';
import { DEFAULT_SETTINGS } from './settings';
import { formatTime, civilDateIn, addDays } from './time';
import { toHijri, nextOccurrence, hijriMonthOf } from './hijri';
import { juzRanges, juzOf, parseRef, foldName, type SurahMeta } from './quran';
import type { SavedLocation } from './location';
import { searchOfflineCities, nearestCity } from './location';

const raleigh: SavedLocation = { name: 'Raleigh', lat: 35.775, lng: -78.6336, tz: 'America/New_York', source: 'manual' };
const list = surahs as SurahMeta[];

describe('prayer times', () => {
  // Reference values from the adhan library's own test-suite (ISNA, Hanafi, 12 July 2015).
  it('matches published reference times regardless of device time zone', () => {
    const s = { ...DEFAULT_SETTINGS, method: 'NorthAmerica' as const, madhab: 'hanafi' as const };
    const day = computeDay(raleigh, { y: 2015, m: 7, d: 12 }, s);
    const fmt = (d: Date) => formatTime(d, raleigh.tz, '12h');
    expect(fmt(day.times.fajr)).toBe('4:42 AM');
    expect(fmt(day.times.sunrise)).toBe('6:08 AM');
    expect(fmt(day.times.dhuhr)).toBe('1:21 PM');
    expect(fmt(day.times.asr)).toBe('6:22 PM');
    expect(fmt(day.times.maghrib)).toBe('8:32 PM');
    expect(fmt(day.times.isha)).toBe('9:57 PM');
  });

  it('applies manual adjustments', () => {
    const s = { ...DEFAULT_SETTINGS, method: 'NorthAmerica' as const, madhab: 'hanafi' as const };
    const adj = { ...s, adjustments: { ...s.adjustments, maghrib: 3 } };
    const a = computeDay(raleigh, { y: 2015, m: 7, d: 12 }, s);
    const b = computeDay(raleigh, { y: 2015, m: 7, d: 12 }, adj);
    expect(b.times.maghrib.getTime() - a.times.maghrib.getTime()).toBe(3 * 60000);
  });

  it('rolls the next prayer over to tomorrow’s Fajr after Isha', () => {
    const now = new Date('2015-07-13T03:30:00Z'); // 11:30 PM in New York
    const st = prayerState(raleigh, now, DEFAULT_SETTINGS);
    expect(st.next.key).toBe('fajr');
    expect(st.next.tomorrow).toBe(true);
    expect(st.next.time > now).toBe(true);
  });

  it('picks the next prayer during the day', () => {
    const now = new Date('2015-07-12T18:00:00Z'); // 2:00 PM in New York
    const st = prayerState(raleigh, now, DEFAULT_SETTINGS);
    expect(st.next.key).toBe('asr');
    expect(st.current).toBe('dhuhr');
  });

  it('recommends regional methods', () => {
    expect(recommendedMethod('Asia/Riyadh')).toBe('UmmAlQura');
    expect(recommendedMethod('America/Chicago')).toBe('NorthAmerica');
    expect(recommendedMethod('Asia/Karachi')).toBe('Karachi');
    expect(recommendedMethod('Europe/Paris')).toBe('MuslimWorldLeague');
  });

  it('produces valid times at high latitudes', () => {
    const oslo: SavedLocation = { name: 'Tromsø', lat: 69.65, lng: 18.96, tz: 'Europe/Oslo', source: 'manual' };
    const day = computeDay(oslo, { y: 2026, m: 6, d: 21 }, DEFAULT_SETTINGS);
    expect(Number.isNaN(day.times.isha.getTime())).toBe(false);
  });
});

describe('time helpers', () => {
  it('gets the civil date in a given zone', () => {
    const instant = new Date('2026-01-01T02:00:00Z');
    expect(civilDateIn(instant, 'America/Los_Angeles')).toEqual({ y: 2025, m: 12, d: 31 });
    expect(civilDateIn(instant, 'Asia/Tokyo')).toEqual({ y: 2026, m: 1, d: 1 });
    expect(addDays({ y: 2024, m: 2, d: 28 }, 1)).toEqual({ y: 2024, m: 2, d: 29 });
  });
});

describe('hijri', () => {
  it('converts using Umm al-Qura', () => {
    expect(toHijri({ y: 2025, m: 3, d: 1 })).toEqual({ y: 1446, m: 9, d: 1 });
    expect(toHijri({ y: 2025, m: 3, d: 1 }, -1)).toEqual({ y: 1446, m: 8, d: 29 });
  });
  it('finds the next Eid al-Fitr', () => {
    expect(nextOccurrence({ y: 2025, m: 3, d: 1 }, 10, 1)).toEqual({ y: 2025, m: 3, d: 30 });
  });
  it('builds a full month', () => {
    const month = hijriMonthOf({ y: 2025, m: 3, d: 10 })!;
    expect(month[0].hijri.d).toBe(1);
    expect([29, 30]).toContain(month.length);
  });
});

describe('quran helpers', () => {
  it('covers every verse exactly once across the 30 juz', () => {
    let total = 0;
    for (let j = 1; j <= 30; j++) for (const r of juzRanges(j, list)) total += r.to - r.from + 1;
    expect(total).toBe(6236);
    expect(juzRanges(1, list)).toEqual([
      { surah: 1, from: 1, to: 7 },
      { surah: 2, from: 1, to: 141 },
    ]);
    expect(juzRanges(30, list).length).toBe(37);
  });
  it('finds the juz of a verse', () => {
    expect(juzOf(2, 255)).toBe(3);
    expect(juzOf(18, 74)).toBe(15);
    expect(juzOf(114, 6)).toBe(30);
  });
  it('parses references and folds names', () => {
    expect(parseRef('2:255', list)).toEqual({ surah: 2, ayah: 255 });
    expect(parseRef('2:300', list)).toBeNull();
    expect(parseRef('115', list)).toBeNull();
    expect(foldName('Al-Baqarah')).toBe(foldName('baqara'));
  });
});

describe('location', () => {
  it('searches offline cities and finds the nearest one', () => {
    expect(searchOfflineCities('lond')[0].name).toBe('London');
    expect(searchOfflineCities('sao')[0].name).toBe('São Paulo');
    expect(nearestCity(51.5, -0.12)?.name).toBe('London');
    expect(nearestCity(0, -30)).toBeNull();
  });
});

describe('displayArabic', () => {
  it('maps only the three open-tanween code points and nothing else', async () => {
    const { displayArabic } = await import('./quran');
    const fs = await import('node:fs');
    for (let s = 1; s <= 114; s++) {
      const verses: string[] = JSON.parse(fs.readFileSync(`public/data/quran/ar/${s}.json`, 'utf8'));
      for (const v of verses) {
        const d = displayArabic(v);
        expect(d.length).toBe(v.length);
        for (let i = 0; i < v.length; i++) {
          if (v[i] !== d[i]) expect(['ٖ', 'ٗ', 'ٞ']).toContain(v[i]);
        }
      }
    }
  });
});
