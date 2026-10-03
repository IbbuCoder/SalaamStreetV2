# SalaamStreet

A calm, everyday Islamic website: accurate prayer times, a prayer tracker, the Quran, Qibla, duas & adhkar, a tasbih counter, the Hijri calendar and beginner learning guides. It works on phones, tablets and desktops.

**Version 1.0** is the core website. The shop, mobile apps and other larger features are planned for later and appear only on the in-app [Roadmap](src/content/roadmap.ts).

## Features

| Area | What it does |
| --- | --- |
| **Today** | Next prayer with countdown, today's schedule with one-tap tracking, Hijri + Gregorian date, quick access, adhkar suggestion for the time of day, next Islamic date |
| **Prayer times** | Calculated on the device with [Adhan](https://github.com/batoulapps/adhan-js), so they work offline. Supports 12 calculation methods (auto-recommended per region), Standard/Hanafi Asr, high-latitude rules, per-prayer minute adjustments, 12/24-hour format, location time zones and DST, plus a 7-day table |
| **Prayer tracker** | ✓ completed / — missed / ○ not marked, daily progress, a 14-day history you can correct |
| **Quran** | 114 surahs and 30 juzʾ, Uthmani Arabic, 7 translations, optional transliteration, adjustable sizes, bookmarks, last-read/continue, search by name, reference (`2:255`) or translation text |
| **Qibla** | Great-circle bearing and distance, live compass on phones (iOS permission flow included), static dial and calibration help elsewhere |
| **Duas & Adhkar** | 8 categories with Arabic, transliteration, translation and references. Quranic passages are loaded verbatim from the Quran data |
| **Tasbih** | Big tap target, targets (33/99/100/none), rounds, persistent count, vibration, keyboard support |
| **Hijri calendar** | Umm al-Qura month grid, important dates with countdowns, the 12 months, ±day offset for local moon sighting |
| **Learn** | Five pillars, wudu, salah, ghusl, terminology, new-Muslim path, with sources and notes on differences between schools |
| **Settings** | Location, calculation, Hijri offset, Quran reading, theme (system/light/dark), notification placeholders, language, privacy, delete data |

## Stack

- **Vite + React 19 + TypeScript**, React Router, hand-written CSS with design tokens (no UI framework).
- **adhan** for prayer times and Qibla. **Intl** (`islamic-umalqura`) for Hijri dates.
- **lucide-react** icons; self-hosted fonts via Fontsource (Figtree, Fraunces, Amiri Quran).
- No backend, no accounts, no analytics. User data lives in `localStorage`.
- A small service worker (`public/sw.js`) caches the app and Quran data for offline use.

## Getting started

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build
```

### Tests

```bash
npm test           # unit tests (prayer calculations, Hijri, Quran helpers, location)
npm run build && npm run test:e2e   # browser tests across 7 viewports
```

The browser tests use `playwright-core` with a local Chromium (`CHROMIUM_PATH`, default `/opt/pw-browsers/chromium`). They check every route for horizontal overflow and console errors at 320–1920px, run the main user flows (location setup, tracker, Quran, duas, tasbih, Qibla, settings), check error states, and crawl for broken links. Screenshots go to `screenshots/` (git-ignored).

## Project structure

```
src/
  App.tsx              routes (pages are lazy-loaded; Today ships with the shell)
  components/          layout/navigation, prayer widgets, location setup, states, toast
  pages/               one file per route
  lib/                 framework-free logic: prayer, hijri, qibla, quran, location, time, settings, storage
  hooks/               React glue (current time, prayer state, tracker, compass, async)
  content/             curated content: duas, dhikr, learning, Islamic dates, cities, roadmap
  styles/              global design system + per-feature stylesheets
public/
  data/quran/          generated Quran data (see below)
  sw.js, manifest.webmanifest, icons/
scripts/
  build-quran-data.mjs regenerates public/data/quran from the source package
  e2e.mjs              browser test suite
```

## Content and sources

Religious content must never be invented or generated.

- **Quran text**: Uthmani script (King Fahd Complex) via QuranEnc; translations via Tanzil.net/QuranEnc; packaged by [`quran-json`](https://github.com/risan/quran-json) (CC BY-SA 4.0). `scripts/build-quran-data.mjs` only reshapes the JSON. To regenerate:
  ```bash
  npm pack quran-json@3.1.2 && tar xzf quran-json-3.1.2.tgz
  QURAN_JSON_DIR=./package npm run data:quran
  ```
  For display, three open-tanween code points from the KFGQPC encoding are mapped to their standard Unicode equivalents (`displayArabic` in `src/lib/quran.ts`) so that standard fonts render them correctly. A unit test checks that nothing else changes.
- **Duas** (`src/content/duas.ts`): Quranic passages refer to verses by reference and are loaded from the Quran data. Supplications from the Sunnah are limited to well-known narrations with collection and number (sunnah.com numbering). Verify against a primary source before adding anything.
- **Learning** (`src/content/learn.ts`): broadly agreed matters only, with sources, and notes where the madhhabs differ.

## Deployment

The output in `dist/` is a static single-page app. Unknown paths must fall back to `index.html`; config for this is included for Netlify (`public/_redirects`) and Vercel (`vercel.json`). The online city search uses the free Open-Meteo geocoding API, which needs no key. There are no secrets in this project.

## Versioning

The size of the version number reflects the size of the change: `1.01` for a small fix, `1.1` for a feature update, `1.34` for a bundle of small items, `1.5` for a larger update and `2.0` for a new phase. The current version is in `src/content/roadmap.ts` (`APP_VERSION`).
