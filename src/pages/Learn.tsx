import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { PageHead } from '../components/PageHead';
import { LEARN_TOPICS } from '../content/learn';
import '../styles/learn.css';

export default function LearnPage() {
  return (
    <div className="page">
      <PageHead title="Learn" sub="Clear, sourced introductions to the essentials of Islamic practice." />
      <ul className="topic-grid">
        {LEARN_TOPICS.map((t) => (
          <li key={t.id}>
            <Link to={`/learn/${t.id}`} className="topic-card">
              <span className="arabic topic-card__ar" lang="ar" aria-hidden="true">
                {t.arabic}
              </span>
              <span className="badge">{t.level}</span>
              <span className="topic-card__title">{t.title}</span>
              <span className="topic-card__sum">{t.summary}</span>
              <span className="topic-card__go">
                Read <ChevronRight size={16} aria-hidden="true" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="tiny muted learn-note">
        These guides introduce matters that are broadly agreed upon and note where the schools of law differ. They are not a
        substitute for learning from a qualified teacher.
      </p>
    </div>
  );
}
