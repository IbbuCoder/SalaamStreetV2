// Generates the static Quran data served from public/data/quran.
//
// Source: the `quran-json` package (v3.1.2, CC BY-SA 4.0, Risan Bagja Pradana),
// which packages the Uthmani text from The Noble Qur'an Encyclopedia (QuranEnc),
// transliteration from Tanzil.net, and translations from Tanzil.net / QuranEnc.
//
// The text is copied verbatim — this script only reshapes JSON, it never edits wording.
//
// Usage:
//   npm pack quran-json@3.1.2 && tar xzf quran-json-3.1.2.tgz
//   QURAN_JSON_DIR=./package npm run data:quran
import fs from 'node:fs';
import path from 'node:path';

const src = process.env.QURAN_JSON_DIR ?? 'node_modules/quran-json';
const dist = path.join(src, 'dist', 'chapters');
const out = path.join('public', 'data', 'quran');
const LANGS = ['en', 'ur', 'id', 'tr', 'fr', 'bn', 'es'];

if (!fs.existsSync(dist)) {
  console.error(`Cannot find ${dist}. Set QURAN_JSON_DIR to an extracted quran-json package.`);
  process.exit(1);
}

const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const write = (p, data) => {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(data));
};

const surahs = [];
for (let n = 1; n <= 114; n++) {
  const en = read(path.join(dist, 'en', `${n}.json`));
  surahs.push({
    n,
    ar: en.name,
    tr: en.transliteration,
    en: en.translation,
    type: en.type,
    ayahs: en.total_verses,
  });
  write(path.join(out, 'ar', `${n}.json`), en.verses.map((v) => v.text));
  write(path.join(out, 'translit', `${n}.json`), en.verses.map((v) => v.transliteration));
  for (const lang of LANGS) {
    const t = read(path.join(dist, lang, `${n}.json`));
    if (t.verses.length !== en.total_verses) throw new Error(`Verse count mismatch ${lang} ${n}`);
    write(path.join(out, lang, `${n}.json`), t.verses.map((v) => v.translation));
  }
}
write(path.join(out, 'surahs.json'), surahs);

// Quranic passages quoted in the Duas & Adhkar section (src/content/duas.ts).
// Pre-extracted so that page can show verbatim text without loading whole surahs.
const EXCERPTS = [
  '1:1-7', '2:201', '2:255', '2:285-286', '3:8', '7:23', '9:129', '14:40-41',
  '17:24', '20:25-28', '20:114', '21:87', '25:74', '43:13-14', '112:1-4', '113:1-5', '114:1-6',
];
const excerpts = {};
for (const ref of EXCERPTS) {
  const [s, range] = ref.split(':');
  const [from, to = from] = range.split('-').map(Number);
  const ch = read(path.join(dist, 'en', `${s}.json`));
  const verses = ch.verses.slice(from - 1, to);
  if (verses.length !== to - from + 1) throw new Error(`Bad excerpt ${ref}`);
  excerpts[ref] = {
    surah: ch.transliteration,
    ar: verses.map((v) => v.text),
    tl: verses.map((v) => v.transliteration),
    en: verses.map((v) => v.translation),
  };
}
write(path.join(out, 'excerpts.json'), excerpts);
console.log(`Wrote ${surahs.length} surahs × (${LANGS.length} translations + Arabic + transliteration) to ${out}`);
