import { useCallback, useEffect, useState } from 'react';

export type AsyncState<T> = { status: 'loading' } | { status: 'error'; error: Error } | { status: 'ok'; data: T };

/** Runs an async loader when `deps` change; exposes a `retry`. */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]): [AsyncState<T>, () => void] {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let alive = true;
    setState({ status: 'loading' });
    fn().then(
      (data) => alive && setState({ status: 'ok', data }),
      (error) => alive && setState({ status: 'error', error: error instanceof Error ? error : new Error(String(error)) }),
    );
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt]);
  const retry = useCallback(() => setAttempt((a) => a + 1), []);
  return [state, retry];
}
