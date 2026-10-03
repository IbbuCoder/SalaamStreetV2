import { useEffect, useState } from 'react';

/** Current time, refreshed every `intervalMs` (aligned to the second) and when the tab regains focus. */
export function useNow(intervalMs = 1000): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    let timer: number;
    const tick = () => {
      setNow(new Date());
      timer = window.setTimeout(tick, intervalMs - (Date.now() % 1000));
    };
    timer = window.setTimeout(tick, intervalMs - (Date.now() % 1000));
    const onVisible = () => document.visibilityState === 'visible' && setNow(new Date());
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [intervalMs]);
  return now;
}
