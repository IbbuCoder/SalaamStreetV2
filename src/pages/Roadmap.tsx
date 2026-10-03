import { CircleCheck } from 'lucide-react';
import { PageHead } from '../components/PageHead';
import { RELEASES, type Release } from '../content/roadmap';
import '../styles/roadmap.css';

const STATUS: Record<Release['status'], string> = {
  current: 'Available now',
  next: 'Up next',
  planned: 'Planned',
  vision: 'The vision',
};

export default function RoadmapPage() {
  return (
    <div className="page page--narrow">
      <PageHead
        eyebrow="Roadmap"
        title="What’s coming"
        sub="SalaamStreet is growing step by step. Here is what is available today, and where we are heading."
      />
      <ol className="timeline">
        {RELEASES.map((r) => (
          <li key={r.version} className={`release release--${r.status}`}>
            <div className="release__marker" aria-hidden="true">
              {r.status === 'current' ? <CircleCheck /> : <span />}
            </div>
            <article className="release__card">
              <header className="release__head">
                <span className="release__version">Version {r.version}</span>
                <span className={`badge${r.status === 'current' ? ' badge--primary' : r.status === 'vision' ? ' badge--accent' : ''}`}>
                  {STATUS[r.status]}
                </span>
              </header>
              <h2 className="release__title">{r.title}</h2>
              <p className="release__summary">{r.summary}</p>
              <ul className="release__items">
                {r.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            </article>
          </li>
        ))}
      </ol>
      <section className="card card-pad versioning">
        <h2 className="h-small">How version numbers work</h2>
        <p className="muted small">
          The size of the number reflects the size of the update: <strong>1.01</strong> is a small fix, <strong>1.1</strong>{' '}
          adds features, <strong>1.34</strong> bundles several small improvements, <strong>1.5</strong> is a larger update and{' '}
          <strong>2.0</strong> starts a new phase. Future plans may change as we learn what is most useful — nothing beyond
          version 1.0 is available yet.
        </p>
      </section>
    </div>
  );
}
