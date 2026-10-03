import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import { PageHead } from '../components/PageHead';
import { ErrorState } from '../components/States';
import { DUA_CATEGORIES, DUA_SOURCES_NOTE, findCategory, quranRefs, type Dua } from '../content/duas';
import { useAsync } from '../hooks/useAsync';
import { displayArabic, loadExcerpts, type Excerpt } from '../lib/quran';
import { createPersistedStore } from '../lib/store';
import { useSettings } from '../lib/SettingsContext';
import NotFoundPage from './NotFound';
import '../styles/duas.css';

const translitStore = createPersistedStore<boolean>('duas.translit', true);

export default function DuaCategoryPage() {
  const { category = '' } = useParams();
  const cat = findCategory(category);
  const needsQuran = !!cat?.items.some((d) => d.quran);
  const [excerpts, retry] = useAsync(() => (needsQuran ? loadExcerpts() : Promise.resolve({})), [needsQuran]);
  const showTl = translitStore.use();

  if (!cat) return <NotFoundPage />;
  const idx = DUA_CATEGORIES.indexOf(cat);
  const next = DUA_CATEGORIES[idx + 1];

  return (
    <div className="page page--narrow">
      <PageHead
        back={{ to: '/duas', label: 'Duas & Adhkar' }}
        title={cat.title}
        sub={cat.blurb}
        actions={
          <div className="switch-row switch-row--inline">
            <label htmlFor="tl-toggle">
              <span className="label small">Transliteration</span>
            </label>
            <span className="switch">
              <input id="tl-toggle" type="checkbox" checked={showTl} onChange={(e) => translitStore.set(e.target.checked)} />
              <span />
            </span>
          </div>
        }
      />

      {excerpts.status === 'error' && (
        <div className="card" style={{ marginBottom: 16 }}>
          <ErrorState
            title="Quranic passages could not be loaded"
            message="The verses in this section could not be loaded. Check your connection and try again."
            onRetry={retry}
          />
        </div>
      )}

      <ol className="dua-list list-plain">
        {cat.items.map((d, i) => (
          <li key={d.id}>
            <DuaCard
              dua={d}
              index={i + 1}
              showTl={showTl}
              excerpts={
                excerpts.status === 'ok'
                  ? quranRefs(d).map((r) => (excerpts.data as Record<string, Excerpt>)[r]).filter(Boolean)
                  : []
              }
              loading={!!d.quran && excerpts.status === 'loading'}
            />
          </li>
        ))}
      </ol>

      <p className="tiny muted dua-foot">{DUA_SOURCES_NOTE}</p>
      {next && (
        <Link to={`/duas/${next.id}`} className="btn btn-block next-cat">
          Next: {next.title}
        </Link>
      )}
    </div>
  );
}

function DuaCard({
  dua,
  index,
  showTl,
  excerpts,
  loading,
}: {
  dua: Dua;
  index: number;
  showTl: boolean;
  excerpts: Excerpt[];
  loading: boolean;
}) {
  const { settings } = useSettings();
  const fromQuran = excerpts.length > 0;
  const parts = fromQuran
    ? excerpts.map((e) => ({ ar: displayArabic(e.ar.join(' ')), tl: e.tl.join(' '), tr: e.en.join(' ') }))
    : [{ ar: dua.arabic, tl: dua.translit, tr: dua.translation }];
  const arSize = Math.max(24, settings.quran.arabicSize - 4);

  return (
    <article className="card dua" aria-labelledby={`dua-${dua.id}`}>
      <header className="dua__head">
        <span className="dua__num" aria-hidden="true">
          {index}
        </span>
        <h2 id={`dua-${dua.id}`} className="dua__title">
          {dua.title}
        </h2>
        {dua.count && <RepeatCounter target={dua.count} label={dua.title} />}
      </header>

      {loading ? (
        <div className="dua__body">
          <div className="skeleton" style={{ height: 36, width: '85%', marginLeft: 'auto' }} />
          <div className="skeleton" style={{ height: 14, width: '70%', marginTop: 16 }} />
        </div>
      ) : (
        <div className="dua__body">
          {parts.map((p, i) => (
            <div key={i} className="dua__part">
              {p.ar && (
                <p className="arabic dua__ar" lang="ar" style={{ fontSize: arSize }}>
                  {p.ar}
                </p>
              )}
              {showTl && p.tl && <p className="dua__tl">{p.tl}</p>}
              {p.tr && (
                <p className="dua__tr">
                  {fromQuran && i === 0 && <span className="dua__label">Translation · Saheeh International</span>}
                  {p.tr}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {dua.note && <p className="dua__note">{dua.note}</p>}
      <p className="dua__src">
        <span className="visually-hidden">Source: </span>
        {dua.quran ? <Link to={quranLink(quranRefs(dua)[0])}>{dua.source}</Link> : dua.source}
      </p>
    </article>
  );
}

function quranLink(ref: string) {
  const [s, range] = ref.split(':');
  return `/quran/${s}?ayah=${range.split('-')[0]}`;
}

function RepeatCounter({ target, label }: { target: number; label: string }) {
  const [n, setN] = useState(0);
  const done = n >= target;
  return (
    <span className="repeat">
      <button
        type="button"
        className={`repeat__btn${done ? ' is-done' : ''}`}
        onClick={() => setN((x) => (x >= target ? x : x + 1))}
        aria-label={`Count ${label}: ${n} of ${target}`}
      >
        {done ? '✓ ' : ''}
        {n}/{target}×
      </button>
      {n > 0 && (
        <button type="button" className="icon-btn repeat__reset" onClick={() => setN(0)} aria-label={`Reset count for ${label}`}>
          <RotateCcw size={16} aria-hidden="true" />
        </button>
      )}
    </span>
  );
}
