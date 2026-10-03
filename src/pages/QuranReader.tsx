import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Bookmark, BookmarkCheck, ChevronLeft, ChevronRight, Copy, Type } from 'lucide-react';
import { PageHead } from '../components/PageHead';
import { ReadingSettings } from '../components/ReadingSettings';
import { ErrorState } from '../components/States';
import { useToast } from '../components/Toast';
import { useAsync } from '../hooks/useAsync';
import {
  bookmarksStore,
  displayArabic,
  juzRanges,
  lastReadStore,
  loadSurah,
  loadSurahList,
  toggleBookmark,
  type Range,
  type SurahMeta,
  type Verse,
} from '../lib/quran';
import { TRANSLATIONS } from '../lib/settings';
import { useSettings } from '../lib/SettingsContext';
import NotFoundPage from './NotFound';
import '../styles/quran.css';

interface Section {
  meta: SurahMeta;
  verses: Verse[];
  showHeader: boolean;
}

const toArabicDigits = (n: number) => String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);

export default function QuranReaderPage() {
  const params = useParams();
  const juz = params.juz ? Number(params.juz) : null;
  const surah = params.surah ? Number(params.surah) : null;
  const valid = juz != null ? Number.isInteger(juz) && juz >= 1 && juz <= 30 : surah != null && Number.isInteger(surah) && surah >= 1 && surah <= 114;
  if (!valid) return <NotFoundPage />;
  return <Reader key={juz ? `j${juz}` : `s${surah}`} juz={juz} surah={surah} />;
}

function Reader({ juz, surah }: { juz: number | null; surah: number | null }) {
  const { settings } = useSettings();
  const q = settings.quran;
  const [showSettings, setShowSettings] = useState(false);
  const [search] = useSearchParams();
  const targetAyah = Number(search.get('ayah')) || null;

  const [state, retry] = useAsync(async () => {
    const list = await loadSurahList();
    const ranges: Range[] = juz ? juzRanges(juz, list) : [{ surah: surah!, from: 1, to: list[surah! - 1].ayahs }];
    const opts = { translation: q.translation, transliteration: q.transliteration };
    const [bismillah, ...loaded] = await Promise.all([
      loadSurah(1, { translation: 'none', transliteration: false }).then((v) => v[0].ar),
      ...ranges.map((r) => loadSurah(r.surah, opts)),
    ]);
    const sections: Section[] = ranges.map((r, i) => ({
      meta: list[r.surah - 1],
      verses: loaded[i].slice(r.from - 1, r.to),
      showHeader: r.from === 1,
    }));
    return { list, sections, bismillah };
  }, [juz, surah, q.translation, q.transliteration]);

  const title = juz ? `Juzʾ ${juz}` : state.status === 'ok' ? state.data.sections[0].meta.tr : 'Quran';

  return (
    <div className="page page--reader">
      <PageHead
        back={{ to: juz ? '/quran?tab=juz' : '/quran', label: 'Quran' }}
        docTitle={title}
        title={juz ? `Juzʾ ${juz}` : state.status === 'ok' ? state.data.sections[0].meta.tr : 'Loading…'}
        sub={
          state.status === 'ok' && !juz
            ? `${state.data.sections[0].meta.en} · ${state.data.sections[0].meta.ayahs} verses · ${state.data.sections[0].meta.type === 'meccan' ? 'Meccan' : 'Medinan'}`
            : state.status === 'ok' && juz
              ? `${state.data.sections[0].meta.tr} ${state.data.sections[0].verses[0].n} – ${state.data.sections.at(-1)!.meta.tr} ${state.data.sections.at(-1)!.verses.at(-1)!.n}`
              : undefined
        }
        actions={
          <button
            type="button"
            className={`btn btn-sm${showSettings ? ' is-on' : ''}`}
            aria-expanded={showSettings}
            aria-controls="reading-panel"
            onClick={() => setShowSettings((v) => !v)}
          >
            <Type aria-hidden="true" /> Reading
          </button>
        }
      />

      {showSettings && (
        <section id="reading-panel" className="card card-pad reading-panel" aria-label="Reading preferences">
          <ReadingSettings idPrefix="reader" />
        </section>
      )}

      {state.status === 'loading' && <ReaderSkeleton />}
      {state.status === 'error' && (
        <div className="card">
          <ErrorState
            title="This surah could not be loaded"
            message="Please check your internet connection and try again. Surahs you have opened before are available offline."
            onRetry={retry}
          />
        </div>
      )}
      {state.status === 'ok' && (
        <>
          <VerseList sections={state.data.sections} bismillah={state.data.bismillah} targetAyah={targetAyah} />
          <ReaderNav juz={juz} surah={surah} list={state.data.list} />
          <p className="source-note tiny muted">
            Arabic: Uthmani script, King Fahd Complex text via QuranEnc.
            {q.translation !== 'none' && <> Translation: {TRANSLATIONS.find((t) => t.id === q.translation)?.author}.</>}{' '}
            <Link to="/about#sources">Sources</Link>
          </p>
        </>
      )}
    </div>
  );
}

function ReaderSkeleton() {
  return (
    <div className="verses" aria-busy="true" aria-label="Loading verses">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="verse">
          <div className="skeleton" style={{ height: 40, width: '80%', marginLeft: 'auto' }} />
          <div className="skeleton" style={{ height: 16, width: '90%', marginTop: 18 }} />
          <div className="skeleton" style={{ height: 16, width: '60%', marginTop: 8 }} />
        </div>
      ))}
    </div>
  );
}

function VerseList({ sections, bismillah, targetAyah }: { sections: Section[]; bismillah: string; targetAyah: number | null }) {
  const { settings } = useSettings();
  const q = settings.quran;
  const dir = TRANSLATIONS.find((t) => t.id === q.translation)?.dir ?? 'ltr';
  const bookmarks = bookmarksStore.use();
  const marked = useMemo(() => new Set(bookmarks.map((b) => `${b.surah}:${b.ayah}`)), [bookmarks]);
  const toast = useToast();
  const container = useRef<HTMLDivElement>(null);
  const [highlight, setHighlight] = useState<string | null>(null);

  // Jump to ?ayah=N once verses are rendered.
  useEffect(() => {
    if (!targetAyah) return;
    const id = `${sections[0].meta.n}:${targetAyah}`;
    const el = document.getElementById(`v-${id}`);
    if (el) {
      el.scrollIntoView({ block: 'start' });
      setHighlight(id);
      const t = setTimeout(() => setHighlight(null), 2200);
      return () => clearTimeout(t);
    }
  }, [targetAyah, sections]);

  // Remember the last verse that reached the top part of the screen.
  useEffect(() => {
    const root = container.current;
    if (!root || !('IntersectionObserver' in window)) return;
    let timer: number | undefined;
    let pending: (() => void) | null = null;
    const flush = () => {
      window.clearTimeout(timer);
      pending?.();
      pending = null;
    };
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).map((e) => e.target as HTMLElement);
        if (!visible.length) return;
        const el = visible.sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top)[0];
        const s = Number(el.dataset.s);
        const a = Number(el.dataset.a);
        const name = sections.find((x) => x.meta.n === s)?.meta.tr;
        window.clearTimeout(timer);
        // Debounced while scrolling, but flushed when leaving the page so no position is lost.
        pending = () => lastReadStore.set({ surah: s, ayah: a, at: Date.now(), name });
        timer = window.setTimeout(flush, 700);
      },
      { rootMargin: '-10% 0px -70% 0px' },
    );
    root.querySelectorAll('.verse').forEach((el) => io.observe(el));
    window.addEventListener('pagehide', flush);
    return () => {
      io.disconnect();
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, [sections]);

  const copy = async (meta: SurahMeta, v: Verse) => {
    const text = [v.ar, v.translation, `— ${meta.tr} ${meta.n}:${v.n}`].filter(Boolean).join('\n\n');
    try {
      await navigator.clipboard.writeText(text);
      toast('Verse copied');
    } catch {
      toast('Copying is not available in this browser');
    }
  };

  return (
    <div
      ref={container}
      className="verses"
      style={{ '--ar-size': `${q.arabicSize}px`, '--tr-size': `${q.translationSize}px` } as React.CSSProperties}
    >
      {sections.map(({ meta, verses, showHeader }) => (
        <section key={meta.n} aria-label={`Surah ${meta.tr}`}>
          {showHeader && (
            <header className="surah-head">
              <p className="arabic surah-head__ar" lang="ar">
                سُورَةُ {meta.ar}
              </p>
              {sections.length > 1 && (
                <h2 className="surah-head__en">
                  {meta.n}. {meta.tr} <span className="muted">· {meta.en}</span>
                </h2>
              )}
              {meta.n !== 1 && meta.n !== 9 && (
                <p className="arabic bismillah" lang="ar">
                  {displayArabic(bismillah)}
                </p>
              )}
            </header>
          )}
          {verses.map((v) => {
            const id = `${meta.n}:${v.n}`;
            const isMarked = marked.has(id);
            return (
              <article
                key={id}
                id={`v-${id}`}
                data-s={meta.n}
                data-a={v.n}
                className={`verse${highlight === id ? ' is-target' : ''}`}
                aria-label={`Verse ${id}`}
              >
                <div className="verse__bar">
                  <span className="verse__ref">{id}</span>
                  <div className="verse__actions">
                    <button
                      type="button"
                      className={`icon-btn${isMarked ? ' is-on' : ''}`}
                      aria-pressed={isMarked}
                      aria-label={isMarked ? `Remove bookmark ${id}` : `Bookmark verse ${id}`}
                      onClick={() => toast(toggleBookmark(meta.n, v.n) ? 'Bookmark added' : 'Bookmark removed')}
                    >
                      {isMarked ? <BookmarkCheck size={20} aria-hidden="true" /> : <Bookmark size={20} aria-hidden="true" />}
                    </button>
                    <button type="button" className="icon-btn" aria-label={`Copy verse ${id}`} onClick={() => copy(meta, v)}>
                      <Copy size={19} aria-hidden="true" />
                    </button>
                  </div>
                </div>
                <p className="arabic verse__ar" lang="ar">
                  {displayArabic(v.ar)} <span className="ayah-mark">{'۝' + toArabicDigits(v.n)}</span>
                </p>
                {v.translit && <p className="verse__tl">{v.translit}</p>}
                {v.translation && (
                  <p className="verse__tr" dir={dir} lang={q.translation}>
                    {v.translation}
                  </p>
                )}
              </article>
            );
          })}
        </section>
      ))}
    </div>
  );
}

function ReaderNav({ juz, surah, list }: { juz: number | null; surah: number | null; list: SurahMeta[] }) {
  const prev = juz ? (juz > 1 ? { to: `/quran/juz/${juz - 1}`, label: `Juzʾ ${juz - 1}` } : null) : surah! > 1 ? { to: `/quran/${surah! - 1}`, label: list[surah! - 2].tr } : null;
  const next = juz ? (juz < 30 ? { to: `/quran/juz/${juz + 1}`, label: `Juzʾ ${juz + 1}` } : null) : surah! < 114 ? { to: `/quran/${surah! + 1}`, label: list[surah!].tr } : null;
  return (
    <nav className="reader-nav" aria-label="Surah navigation">
      {prev ? (
        <Link to={prev.to} className="reader-nav__link">
          <ChevronLeft aria-hidden="true" />
          <span>
            <span className="tiny muted">Previous</span>
            <span>{prev.label}</span>
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link to={next.to} className="reader-nav__link reader-nav__link--next">
          <span>
            <span className="tiny muted">Next</span>
            <span>{next.label}</span>
          </span>
          <ChevronRight aria-hidden="true" />
        </Link>
      )}
    </nav>
  );
}
