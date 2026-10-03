import { useEffect, useMemo, useRef, useState } from 'react';
import { LocateFixed, MapPin, Search } from 'lucide-react';
import {
  LOCATION_ERROR_TEXT,
  LocationError,
  requestDeviceLocation,
  searchOfflineCities,
  searchPlacesOnline,
  type SavedLocation,
} from '../lib/location';
import { useSettings } from '../lib/SettingsContext';
import { deviceTimeZone, isValidTimeZone } from '../lib/time';
import { useToast } from './Toast';

/**
 * Location picker used on first run and in Settings: device location, city
 * search (offline list + online geocoding) or manual coordinates.
 */
export function LocationSetup({ onDone, compact = false }: { onDone?: () => void; compact?: boolean }) {
  const { update } = useSettings();
  const toast = useToast();
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const save = (loc: SavedLocation) => {
    update({ location: loc });
    toast(`Location set to ${loc.name}`);
    onDone?.();
  };

  const useDevice = async () => {
    setLocating(true);
    setGeoError(null);
    try {
      save(await requestDeviceLocation());
    } catch (e) {
      setGeoError(e instanceof LocationError ? LOCATION_ERROR_TEXT[e.kind] : LOCATION_ERROR_TEXT.unavailable);
    } finally {
      setLocating(false);
    }
  };

  return (
    <div className="loc-setup stack">
      <button type="button" className="btn btn-primary btn-block" onClick={useDevice} disabled={locating}>
        {locating ? <span className="spinner spinner--sm" aria-hidden="true" /> : <LocateFixed aria-hidden="true" />}
        {locating ? 'Finding your location…' : 'Use my current location'}
      </button>
      {geoError && (
        <p className="alert" role="alert">
          <MapPin aria-hidden="true" />
          <span>{geoError}</span>
        </p>
      )}
      <div className="or-sep" aria-hidden="true">
        <span>or choose a city</span>
      </div>
      <CitySearch onPick={save} />
      {!compact && <ManualCoords onSave={save} />}
      <p className="tiny muted">
        Your location is stored only on this device and is used to calculate prayer times and the Qibla direction.
      </p>
    </div>
  );
}

function CitySearch({ onPick }: { onPick: (l: SavedLocation) => void }) {
  const [q, setQ] = useState('');
  const [online, setOnline] = useState<SavedLocation[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const offline = useMemo(() => searchOfflineCities(q), [q]);
  const ctrl = useRef<AbortController | null>(null);

  useEffect(() => {
    const query = q.trim();
    ctrl.current?.abort();
    if (query.length < 2) {
      setOnline([]);
      setStatus('idle');
      return;
    }
    const c = new AbortController();
    ctrl.current = c;
    const t = window.setTimeout(async () => {
      setStatus('loading');
      try {
        setOnline(await searchPlacesOnline(query, c.signal));
        setStatus('idle');
      } catch (e) {
        if ((e as Error).name !== 'AbortError') setStatus('error');
      }
    }, 350);
    return () => {
      clearTimeout(t);
      c.abort();
    };
  }, [q]);

  // Merge offline + online results, dropping near-duplicates.
  const results = useMemo(() => {
    const out = [...offline];
    for (const r of online) {
      if (!out.some((o) => o.name === r.name && Math.abs(o.lat - r.lat) < 0.3 && Math.abs(o.lng - r.lng) < 0.3)) out.push(r);
    }
    return out.slice(0, 10);
  }, [offline, online]);

  const query = q.trim();
  return (
    <div className="city-search">
      <label className="visually-hidden" htmlFor="city-q">
        Search for a city
      </label>
      <div className="input-icon">
        <Search aria-hidden="true" />
        <input
          id="city-q"
          className="input"
          type="search"
          inputMode="search"
          autoComplete="off"
          placeholder="Search for a city"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {status === 'loading' && <span className="spinner spinner--sm input-spin" aria-hidden="true" />}
      </div>
      {query.length > 0 && (
        <div className="city-results card" aria-live="polite">
          {results.length > 0 ? (
            <ul className="list">
              {results.map((r) => (
                <li key={`${r.name}-${r.lat}-${r.lng}`}>
                  <button type="button" className="list-link list-btn" onClick={() => onPick(r)}>
                    <MapPin className="muted" size={18} aria-hidden="true" />
                    <span>
                      <strong>{r.name}</strong>
                      {r.country && <span className="muted">, {r.country}</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : status === 'loading' ? (
            <p className="city-msg muted">Searching…</p>
          ) : (
            <p className="city-msg muted">
              {status === 'error'
                ? 'Online search is unavailable right now. Try a major city name, or enter coordinates below.'
                : query.length < 2
                  ? 'Keep typing…'
                  : 'No places found. Check the spelling or try a nearby larger city.'}
            </p>
          )}
          {status === 'error' && results.length > 0 && (
            <p className="city-msg tiny muted">Showing offline results — online search is unavailable.</p>
          )}
        </div>
      )}
    </div>
  );
}

function ManualCoords({ onSave }: { onSave: (l: SavedLocation) => void }) {
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [name, setName] = useState('');
  const [tz, setTz] = useState(deviceTimeZone());
  const [error, setError] = useState<string | null>(null);
  const zones = useMemo(() => {
    try {
      return (Intl as unknown as { supportedValuesOf(k: string): string[] }).supportedValuesOf('timeZone');
    } catch {
      return [deviceTimeZone()];
    }
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const la = Number(lat);
    const lo = Number(lng);
    if (lat.trim() === '' || !Number.isFinite(la) || la < -90 || la > 90) return setError('Latitude must be between -90 and 90.');
    if (lng.trim() === '' || !Number.isFinite(lo) || lo < -180 || lo > 180) return setError('Longitude must be between -180 and 180.');
    if (!isValidTimeZone(tz)) return setError('Please choose a valid time zone.');
    setError(null);
    onSave({ name: name.trim() || 'Custom location', lat: la, lng: lo, tz, source: 'manual' });
  };

  return (
    <details className="disclosure">
      <summary>Enter coordinates manually</summary>
      <form className="manual-form" onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="m-name">Name (optional)</label>
          <input id="m-name" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Home" />
        </div>
        <div className="manual-row">
          <div className="field">
            <label htmlFor="m-lat">Latitude</label>
            <input id="m-lat" className="input" inputMode="decimal" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="51.5074" />
          </div>
          <div className="field">
            <label htmlFor="m-lng">Longitude</label>
            <input id="m-lng" className="input" inputMode="decimal" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="-0.1278" />
          </div>
        </div>
        <div className="field">
          <label htmlFor="m-tz">Time zone</label>
          <select id="m-tz" className="select" value={tz} onChange={(e) => setTz(e.target.value)}>
            {zones.map((z) => (
              <option key={z} value={z}>
                {z.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
        {error && (
          <p className="alert alert--danger" role="alert">
            {error}
          </p>
        )}
        <button type="submit" className="btn">
          Save location
        </button>
      </form>
    </details>
  );
}
