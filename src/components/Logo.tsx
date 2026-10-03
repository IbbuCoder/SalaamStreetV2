/** The SalaamStreet mark: an eight-pointed star (two overlapping squares). */
export function LogoMark({ className = 'brand-mark' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true" fill="none">
      <rect x="7" y="7" width="18" height="18" rx="2.5" stroke="currentColor" strokeWidth="2" />
      <rect x="7" y="7" width="18" height="18" rx="2.5" stroke="currentColor" strokeWidth="2" transform="rotate(45 16 16)" />
      <circle cx="16" cy="16" r="3" fill="currentColor" />
    </svg>
  );
}
