import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function PageHead({
  title,
  eyebrow,
  sub,
  back,
  actions,
  docTitle,
}: {
  title: ReactNode;
  eyebrow?: ReactNode;
  sub?: ReactNode;
  back?: { to: string; label: string };
  actions?: ReactNode;
  docTitle?: string;
}) {
  useDocumentTitle(docTitle ?? (typeof title === 'string' ? title : undefined));
  return (
    <>
      {back && (
        <Link to={back.to} className="back-link">
          <ChevronLeft size={18} aria-hidden="true" />
          {back.label}
        </Link>
      )}
      <header className="page-head">
        <div>
          {eyebrow && <div className="eyebrow">{eyebrow}</div>}
          <h1>{title}</h1>
          {sub && <p className="sub">{sub}</p>}
        </div>
        {actions}
      </header>
    </>
  );
}
