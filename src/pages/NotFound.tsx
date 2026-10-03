import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function NotFoundPage() {
  useDocumentTitle('Page not found');
  return (
    <div className="page page--narrow">
      <div className="card" style={{ marginTop: 24 }}>
        <div className="state">
          <Compass aria-hidden="true" />
          <h1 style={{ fontSize: '1.4rem' }}>Page not found</h1>
          <p>This page doesn’t exist. It may have moved, or the link may be mistyped.</p>
          <div className="actions">
            <Link to="/" className="btn btn-primary">
              Go to Today
            </Link>
            <Link to="/quran" className="btn">
              Open the Quran
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
