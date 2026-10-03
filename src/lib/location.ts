import { CITIES, type City } from '../content/cities';
import { deviceTimeZone, isValidTimeZone } from './time';

export interface SavedLocation {
  name: string;
  country?: string;
  lat: number;
  lng: number;
  tz: string;
  source: 'device' | 'search' | 'manual';
}

export type LocationErrorKind = 'denied' | 'unavailable' | 'timeout' | 'unsupported' | 'insecure';

export class LocationError extends Error {
  constructor(public kind: LocationErrorKind) {
    super(kind);
  }
}

export const LOCATION_ERROR_TEXT: Record<LocationErrorKind, string> = {
  denied:
    'Location permission was denied. You can allow it in your browser settings, or choose your city manually below.',
  unavailable: 'Your device could not determine its location. Please choose your city manually.',
  timeout: 'Finding your location took too long. Try again, or choose your city manually.',
  unsupported: 'This browser does not support location. Please choose your city manually.',
  insecure: 'Location only works on a secure (https) connection. Please choose your city manually.',
};

const toRad = (d: number) => (d * Math.PI) / 180;

/** Great-circle distance in kilometres. */
export function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

export function nearestCity(lat: number, lng: number, maxKm = 60): City | null {
  let best: City | null = null;
  let bestD = Infinity;
  for (const c of CITIES) {
    const d = distanceKm(lat, lng, c.lat, c.lng);
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }
  return bestD <= maxKm ? best : null;
}

export function formatCoords(lat: number, lng: number): string {
  const ns = lat >= 0 ? 'N' : 'S';
  const ew = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(2)}° ${ns}, ${Math.abs(lng).toFixed(2)}° ${ew}`;
}

export function locationLabel(loc: SavedLocation): string {
  return loc.country ? `${loc.name}, ${loc.country}` : loc.name;
}

/**
 * Uses the browser's Geolocation API. Coordinates stay on this device: we only
 * match them against the bundled city list to show a friendly name.
 */
export function requestDeviceLocation(): Promise<SavedLocation> {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && !window.isSecureContext) return reject(new LocationError('insecure'));
    if (!('geolocation' in navigator)) return reject(new LocationError('unsupported'));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const near = nearestCity(lat, lng);
        resolve({
          name: near ? near.name : 'Current location',
          country: near?.country,
          lat,
          lng,
          tz: deviceTimeZone(),
          source: 'device',
        });
      },
      (err) => {
        const kind: LocationErrorKind =
          err.code === err.PERMISSION_DENIED ? 'denied' : err.code === err.TIMEOUT ? 'timeout' : 'unavailable';
        reject(new LocationError(kind));
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 10 * 60 * 1000 },
    );
  });
}

const fold = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '');

export function searchOfflineCities(query: string, limit = 8): SavedLocation[] {
  const q = fold(query.trim());
  if (!q) return [];
  return CITIES.filter((c) => fold(c.name).startsWith(q) || fold(`${c.name} ${c.country}`).includes(q))
    .slice(0, limit)
    .map((c) => ({ name: c.name, country: c.country, lat: c.lat, lng: c.lng, tz: c.tz, source: 'search' as const }));
}

interface GeoResult {
  name: string;
  latitude: number;
  longitude: number;
  timezone?: string;
  country?: string;
  admin1?: string;
}

/**
 * Online city search using the Open-Meteo geocoding API (free, no API key,
 * no account). Only the text typed into the search box is sent.
 */
export async function searchPlacesOnline(query: string, signal?: AbortSignal): Promise<SavedLocation[]> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?count=8&language=en&format=json&name=${encodeURIComponent(query)}`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Search failed (${res.status})`);
  const data = (await res.json()) as { results?: GeoResult[] };
  return (data.results ?? [])
    .filter((r) => r.timezone && isValidTimeZone(r.timezone))
    .map((r) => ({
      name: r.name,
      country: [r.admin1, r.country].filter(Boolean).join(', ') || undefined,
      lat: r.latitude,
      lng: r.longitude,
      tz: r.timezone!,
      source: 'search' as const,
    }));
}
