import { useCallback, useEffect, useRef, useState } from 'react';

type CompassStatus = 'idle' | 'requesting' | 'active' | 'denied' | 'unsupported' | 'no-reading';

interface OrientationEventIOS extends DeviceOrientationEvent {
  webkitCompassHeading?: number;
}

/**
 * Device compass heading (degrees from north) via DeviceOrientation events.
 * iOS needs an explicit permission request from a user gesture.
 */
export function useCompass() {
  const [status, setStatus] = useState<CompassStatus>('idle');
  const [heading, setHeading] = useState<number | null>(null);
  const cleanup = useRef<() => void>(() => {});

  const stop = useCallback(() => {
    cleanup.current();
    cleanup.current = () => {};
    setStatus('idle');
    setHeading(null);
  }, []);

  const start = useCallback(async () => {
    if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) {
      setStatus('unsupported');
      return;
    }
    const DOE = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<'granted' | 'denied'> };
    if (typeof DOE.requestPermission === 'function') {
      setStatus('requesting');
      try {
        if ((await DOE.requestPermission()) !== 'granted') {
          setStatus('denied');
          return;
        }
      } catch {
        setStatus('denied');
        return;
      }
    }

    let got = false;
    const onEvent = (e: Event) => {
      const ev = e as OrientationEventIOS;
      let h: number | null = null;
      if (typeof ev.webkitCompassHeading === 'number') h = ev.webkitCompassHeading;
      else if (ev.absolute && typeof ev.alpha === 'number') h = 360 - ev.alpha;
      if (h == null || Number.isNaN(h)) return;
      const screenAngle = (screen.orientation?.angle ?? 0) as number;
      got = true;
      setStatus('active');
      setHeading((((h + screenAngle) % 360) + 360) % 360);
    };
    const type = 'ondeviceorientationabsolute' in window ? 'deviceorientationabsolute' : 'deviceorientation';
    window.addEventListener(type, onEvent);
    const timer = window.setTimeout(() => {
      if (!got) {
        window.removeEventListener(type, onEvent);
        setStatus('no-reading');
      }
    }, 3000);
    cleanup.current = () => {
      window.removeEventListener(type, onEvent);
      clearTimeout(timer);
    };
    setStatus((s) => (s === 'active' ? s : 'requesting'));
  }, []);

  useEffect(() => () => cleanup.current(), []);

  return { status, heading, start, stop };
}
