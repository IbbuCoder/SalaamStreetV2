import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Bookmark, BookOpen, ChevronRight, Search, Trash2, X } from 'lucide-react';
import { PageHead } from '../components/PageHead';
import { EmptyState, ErrorState } from '../components/States';
import { useAsync } from '../hooks/useAsync';
import {
  bookmarksStore,
  foldName,
  JUZ_STARTS,
  lastReadStore,
  loadSurahList,
  loadTranslation,
  parseRef,
  toggleBookmark,
  type SurahMeta,
} from '../lib/quran';
import { useSettings } from '../lib/SettingsContext';
import '../styles/quran.css';

type Tab = 'surah' | 'juz' | 'bookmarks';

export default function QuranPage() {
  const [list, retry] = useAsync(loadSurahList, []);
  const [params, setParams] = useSearchParams();
  const tab = (params.get('tab') as Tab) || 'surah';
  const [q, setQ] = useState('');
  const bookmarks = bookmarksStore.use();

  const setTab = (t: Tab) => setParams(t === 'surah' ? {} : { tab: t }, { replace: true });

  return (
    <div className="page">
      <PageHead title="The Quran" sub="Read with translation, by surah or by juzʾ." />

      {list.status === 'error' && (
        <div className="card">
          <ErrorState
            title="The Quran could not be loaded"
            message="Please check your internet connection and try again. Surahs you have opened before are available offline."
            onRetry={retry}
          />
        </div>
      )}

      {list.status === 'loading' && <ListSkeleton />}

      {list.status === 'ok' && (
        <>
          <ContinueCard surahs={list.data} />
          <SearchBox q={q} setQ={setQ} surahs={list.data} />
          {q.trim() ? (
            <SearchResults q={q.trim()} surahs={list.data} />
          ) : (
            <>
              <div className="tabs" role="tablist" aria-label="Browse the Quran">
                {(
                  [
                    ['surah', 'Surahs'],
                    ['juz', 'Juzʾ'],
                    ['bookmarks', `Bookmarks${bookmarks.length ? ` (${bookmarks.length})` : ''}`],
                  ] as [Tab, string][]
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    id={`tab-${id}`}
                    aria-selected={tab === id}
                    aria-controls={`panel-${id}`}
                    className="tab"
                    onClick={() => setTab(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
                {tab === 'surah' && <SurahGrid surahs={list.data} />}
                {tab === 'juz' && <JuzGrid surahs={list.data} />}
                {tab === 'bookmarks' && <BookmarkList surahs={list.data} />}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="surah-grid" aria-busy="true" aria-label="Loading surahs">
      {Array.from({ length: 9 }, (_, i) => (
        <div key={i} className="skeleton" style={{ height: 68 }} />
      ))}
    </div>
  );
}

function ContinueCard({ surahs }: { surahs: SurahMeta[] }) {
  const last = lastReadStore.use();
  if (!last) {
    return (
      <Link to="/quran/1" className="card continue">
        <span className="tile-icon">
          <BookOpen aria-hidden="true" />
        </span>
        <span className="continue__text">
          <span className="continue__k">Start reading</span>
          <span className="continue__v">Al-Fatihah · The Opener</span>
        </span>
        <ChevronRight className="chev" aria-hidden="true" />
      </Link>
    );
  }
  const s = surahs[last.surah - 1];
  return (
    <Link to={`/quran/${last.surah}?ayah=${last.ayah}`} className="card continue">
      <span className="tile-icon">
        <BookOpen aria-hidden="true" />
      </span>
      <span className="continue__text">
        <span className="continue__k">Continue reading</span>
        <span className="continue__v">
          {s.tr} · verse {last.ayah} of {s.ayahs}
        </span>
      </span>
      <span className="arabic continue__ar" lang="ar">
        {s.ar}
      </span>
      <ChevronRight className="chev" aria-hidden="true" />
    </Link>
  );
}

function SearchBox({ q, setQ, surahs }: { q: string; setQ: (s: string) => void; surahs: SurahMeta[] }) {
  const navigate = useNavigate();
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ref = parseRef(q, surahs);
    if (ref) navigate(`/quran/${ref.surah}${ref.ayah ? `?ayah=${ref.ayah}` : ''}`);
  };
  return (
    <form className="quran-search" role="search" onSubmit={onSubmit}>
      <label htmlFor="quran-q" className="visually-hidden">
        Search the Quran
      </label>
      <div className="input-icon">
        <Search aria-hidden="true" />
        <input
          id="quran-q"
          className="input"
          type="search"
          autoComplete="off"
          placeholder="Surah name, 2:255, or a word in the translation"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
    </form>
  );
}

function SurahRow({ s, extra }: { s: SurahMeta; extra?: string }) {
  return (
    <Link to={`/quran/${s.n}`} className="surah-row">
      <span className="surah-num" aria-hidden="true">
        {s.n}
      </span>
      <span className="surah-row__main">
        <span className="surah-row__name">
          <span className="visually-hidden">Surah {s.n}: </span>
          {s.tr}
        </span>
        <span className="surah-row__meta">
          {extra ?? `${s.en} · ${s.ayahs} verses`}
        </span>
      </span>
      <span className="arabic surah-row__ar" lang="ar">
        {s.ar}
      </span>
    </Link>
  );
}

function SurahGrid({ surahs }: { surahs: SurahMeta[] }) {
  return (
    <ul className="surah-grid list-plain">
      {surahs.map((s) => (
        <li key={s.n}>
          <SurahRow s={s} />
        </li>
      ))}
    </ul>
  );
}

function JuzGrid({ surahs }: { surahs: SurahMeta[] }) {
  return (
    <ul className="surah-grid list-plain">
      {JUZ_STARTS.map(([s, a], i) => (
        <li key={i}>
          <Link to={`/quran/juz/${i + 1}`} className="surah-row">
            <span className="surah-num" aria-hidden="true">
              {i + 1}
            </span>
            <span className="surah-row__main">
              <span className="surah-row__name">Juzʾ {i + 1}</span>
              <span className="surah-row__meta">
                Starts at {surahs[s - 1].tr} {s}:{a}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function BookmarkList({ surahs }: { surahs: SurahMeta[] }) {
  const bookmarks = bookmarksStore.use();
  if (!bookmarks.length) {
    return (
      <div className="card">
        <EmptyState
          icon={<Bookmark aria-hidden="true" />}
          title="No bookmarks yet"
          message="While reading, tap the bookmark icon beside a verse to save it here."
        />
      </div>
    );
  }
  return (
    <ul className="card list">
      {bookmarks.map((b) => {
        const s = surahs[b.surah - 1];
        return (
          <li key={`${b.surah}:${b.ayah}`} className="bm-row">
            <Link to={`/quran/${b.surah}?ayah=${b.ayah}`} className="list-link">
              <span className="tile-icon">
                <Bookmark aria-hidden="true" />
              </span>
              <span>
                <strong>{s.tr}</strong>
                <span className="muted"> · {b.surah}:{b.ayah}</span>
              </span>
            </Link>
            <button
              type="button"
              className="icon-btn"
              aria-label={`Remove bookmark ${s.tr} ${b.surah}:${b.ayah}`}
              onClick={() => toggleBookmark(b.surah, b.ayah)}
            >
              <Trash2 size={18} aria-hidden="true" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function SearchResults({ q, surahs }: { q: string; surahs: SurahMeta[] }) {
  const ref = parseRef(q, surahs);
  const fq = foldName(q);
  const byName = useMemo(
    () =>
      fq
        ? surahs.filter(
            (s) => foldName(s.tr).includes(fq) || foldName(s.en).includes(fq) || s.ar.includes(q),
          )
        : [],
    [fq, q, surahs],
  );
  return (
    <div className="stack">
      {ref && (
        <Link to={`/quran/${ref.surah}${ref.ayah ? `?ayah=${ref.ayah}` : ''}`} className="card continue">
          <span className="tile-icon">
            <BookOpen aria-hidden="true" />
          </span>
          <span className="continue__text">
            <span className="continue__k">Go to {ref.ayah ? `${ref.surah}:${ref.ayah}` : `Surah ${ref.surah}`}</span>
            <span className="continue__v">{surahs[ref.surah - 1].tr}</span>
          </span>
          <ChevronRight className="chev" aria-hidden="true" />
        </Link>
      )}
      {byName.length > 0 && (
        <section aria-label="Matching surahs">
          <h2 className="h-label">Surahs</h2>
          <ul className="surah-grid list-plain">
            {byName.slice(0, 12).map((s) => (
              <li key={s.n}>
                <SurahRow s={s} />
              </li>
            ))}
          </ul>
        </section>
      )}
      {!ref && q.length >= 3 && <TextSearch q={q} surahs={surahs} />}
      {!ref && q.length < 3 && byName.length === 0 && (
        <p className="muted small">Type at least 3 letters to search the translation.</p>
      )}
    </div>
  );
}

interface Hit {
  surah: number;
  ayah: number;
  text: string;
}

function TextSearch({ q, surahs }: { q: string; surahs: SurahMeta[] }) {
  const { settings } = useSettings();
  const lang = settings.quran.translation === 'none' ? 'en' : settings.quran.translation;
  const [run, setRun] = useState<{ q: string; lang: string } | null>(null);
  const [state, setState] = useState<{ status: 'idle' | 'loading' | 'error' | 'done'; hits: Hit[]; progress: number }>({
    status: 'idle',
    hits: [],
    progress: 0,
  });

  const start = async () => {
    const term = q.toLowerCase();
    setRun({ q, lang });
    setState({ status: 'loading', hits: [], progress: 0 });
    try {
      let loaded = 0;
      const all = await Promise.all(
        surahs.map((s) =>
          loadTranslation(lang, s.n).then((t) => {
            loaded++;
            if (loaded % 10 === 0) setState((p) => ({ ...p, progress: loaded / 114 }));
            return t;
          }),
        ),
      );
      const hits: Hit[] = [];
      all.forEach((verses, si) =>
        verses.forEach((text, ai) => {
          if (text.toLowerCase().includes(term)) hits.push({ surah: si + 1, ayah: ai + 1, text });
        }),
      );
      setState({ status: 'done', hits, progress: 1 });
    } catch {
      setState({ status: 'error', hits: [], progress: 0 });
    }
  };

  const fresh = run && run.q === q && run.lang === lang;

  if (!fresh || state.status === 'idle') {
    return (
      <button type="button" className="btn" onClick={start}>
        <Search aria-hidden="true" /> Search the translation for “{q}”
      </button>
    );
  }
  if (state.status === 'loading') {
    return (
      <div className="state" role="status">
        <div className="spinner" aria-hidden="true" />
        <p>Searching all 114 surahs… {Math.round(state.progress * 100)}%</p>
      </div>
    );
  }
  if (state.status === 'error') {
    return (
      <div className="card">
        <ErrorState title="Search failed" message="Some surahs could not be loaded. Check your connection and try again." onRetry={start} />
      </div>
    );
  }
  if (!state.hits.length) {
    return (
      <div className="card">
        <EmptyState icon={<X aria-hidden="true" />} title="No verses found" message={`No verses in this translation contain “${q}”. Try a different word.`} />
      </div>
    );
  }
  const shown = state.hits.slice(0, 100);
  return (
    <section aria-label="Verse results">
      <h2 className="h-label">
        {state.hits.length} verse{state.hits.length === 1 ? '' : 's'}
        {state.hits.length > shown.length ? ` · showing first ${shown.length}` : ''}
      </h2>
      <ul className="card list">
        {shown.map((h) => (
          <li key={`${h.surah}:${h.ayah}`}>
            <Link to={`/quran/${h.surah}?ayah=${h.ayah}`} className="list-link hit">
              <span className="hit__ref">
                {surahs[h.surah - 1].tr} {h.surah}:{h.ayah}
              </span>
              <span className="hit__text">
                <Highlight text={h.text} term={q} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Highlight({ text, term }: { text: string; term: string }) {
  const i = text.toLowerCase().indexOf(term.toLowerCase());
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark>{text.slice(i, i + term.length)}</mark>
      {text.slice(i + term.length)}
    </>
  );
}
