import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Info } from 'lucide-react';
import { PageHead } from '../components/PageHead';
import { findTopic, LEARN_TOPICS, type Block } from '../content/learn';
import NotFoundPage from './NotFound';
import '../styles/learn.css';

export default function LearnTopicPage() {
  const { topic = '' } = useParams();
  const t = findTopic(topic);
  if (!t) return <NotFoundPage />;
  const idx = LEARN_TOPICS.indexOf(t);
  const next = LEARN_TOPICS[(idx + 1) % LEARN_TOPICS.length];

  return (
    <div className="page page--narrow">
      <PageHead
        back={{ to: '/learn', label: 'Learn' }}
        eyebrow={
          <span className="arabic topic-eyebrow" lang="ar">
            {t.arabic}
          </span>
        }
        title={t.title}
        sub={t.summary}
      />
      <article className="topic">
        {t.sections.map((s) => (
          <section key={s.heading} className="topic__section">
            <h2>{s.heading}</h2>
            {s.blocks.map((b, i) => (
              <BlockView key={i} block={b} />
            ))}
          </section>
        ))}
        <section className="topic__sources" aria-labelledby="sources-title">
          <h2 id="sources-title" className="h-label">
            Sources
          </h2>
          <ul>
            {t.sources.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </section>
      </article>
      <Link to={`/learn/${next.id}`} className="card next-topic">
        <span>
          <span className="tiny muted">Next topic</span>
          <strong>{next.title}</strong>
        </span>
        <ArrowRight aria-hidden="true" />
      </Link>
    </div>
  );
}

function BlockView({ block: b }: { block: Block }) {
  switch (b.type) {
    case 'p':
      return <p className="topic__p">{b.text}</p>;
    case 'note':
      return (
        <p className="alert topic__note">
          <Info aria-hidden="true" />
          <span>{b.text}</span>
        </p>
      );
    case 'list':
      return (
        <ul className="topic__list">
          {b.items.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      );
    case 'link':
      return (
        <p className="topic__link">
          <Link to={b.to}>
            {b.text} <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </p>
      );
    case 'terms':
      return (
        <dl className="terms">
          {b.items.map((x) => (
            <div key={x.term}>
              <dt>
                <span>{x.term}</span>
                {x.arabic && (
                  <span className="arabic terms__ar" lang="ar">
                    {x.arabic}
                  </span>
                )}
              </dt>
              <dd>{x.def}</dd>
            </div>
          ))}
        </dl>
      );
    case 'steps':
      return (
        <ol className="steps">
          {b.items.map((s, i) => (
            <li key={i}>
              <span className="steps__n" aria-hidden="true">
                {i + 1}
              </span>
              <div>
                <p className="steps__title">{s.title}</p>
                {s.arabic && (
                  <p className="arabic steps__ar" lang="ar">
                    {s.arabic}
                  </p>
                )}
                {s.translit && <p className="steps__tl">{s.translit}</p>}
                {s.text && <p className="steps__text">{s.text}</p>}
              </div>
            </li>
          ))}
        </ol>
      );
  }
}
