import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { PageHead } from '../components/PageHead';
import { NAV_META, NAV_TOOLS } from '../components/nav';

export default function MorePage() {
  const tools = NAV_TOOLS.filter((t) => t.to !== '/');
  return (
    <div className="page page--narrow">
      <PageHead title="More" />
      <h2 className="more-label">Tools</h2>
      <ul className="card list">
        {tools.map((t) => (
          <li key={t.to}>
            <Link to={t.to} className="list-link">
              <span className="tile-icon">
                <t.icon aria-hidden="true" />
              </span>
              <span className="more-text">
                <strong>{t.label}</strong>
                <span className="muted small">{t.description}</span>
              </span>
              <ChevronRight className="chev" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
      <h2 className="more-label">SalaamStreet</h2>
      <ul className="card list">
        {NAV_META.map((t) => (
          <li key={t.to}>
            <Link to={t.to} className="list-link">
              <span className="tile-icon">
                <t.icon aria-hidden="true" />
              </span>
              <span className="more-text">
                <strong>{t.label}</strong>
                <span className="muted small">{t.description}</span>
              </span>
              <ChevronRight className="chev" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
