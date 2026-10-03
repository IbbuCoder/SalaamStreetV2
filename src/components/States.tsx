import type { ReactNode } from 'react';
import { TriangleAlert } from 'lucide-react';

export function PageLoading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="state" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  children,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
  children?: ReactNode;
}) {
  return (
    <div className="state" role="alert">
      <TriangleAlert aria-hidden="true" />
      <h2>{title}</h2>
      <p>{message}</p>
      {(onRetry || children) && (
        <div className="actions">
          {onRetry && (
            <button type="button" className="btn btn-primary" onClick={onRetry}>
              Try again
            </button>
          )}
          {children}
        </div>
      )}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  message,
  children,
}: {
  icon: ReactNode;
  title: string;
  message: string;
  children?: ReactNode;
}) {
  return (
    <div className="state">
      {icon}
      <h3>{title}</h3>
      <p>{message}</p>
      {children && <div className="actions">{children}</div>}
    </div>
  );
}
