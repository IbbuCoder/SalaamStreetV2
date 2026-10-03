import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Scrolls to the element matching the URL hash (e.g. /settings#prayer). */
export function useHashScroll(ready = true) {
  const { hash } = useLocation();
  useEffect(() => {
    if (!ready || !hash) return;
    const el = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (el) requestAnimationFrame(() => el.scrollIntoView({ block: 'start' }));
  }, [hash, ready]);
}
