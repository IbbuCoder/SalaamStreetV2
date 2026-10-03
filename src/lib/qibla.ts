import { Coordinates, Qibla } from 'adhan';
import { distanceKm } from './location';

export const KAABA = { lat: 21.4225, lng: 39.8262 };

/** Bearing to the Kaʿbah in degrees clockwise from true north. */
export function qiblaBearing(lat: number, lng: number): number {
  return Qibla(new Coordinates(lat, lng));
}

export function distanceToKaaba(lat: number, lng: number): number {
  return distanceKm(lat, lng, KAABA.lat, KAABA.lng);
}

const POINTS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
const POINT_NAMES: Record<string, string> = {
  N: 'north', E: 'east', S: 'south', W: 'west',
  NE: 'north-east', SE: 'south-east', SW: 'south-west', NW: 'north-west',
  NNE: 'north-north-east', ENE: 'east-north-east', ESE: 'east-south-east', SSE: 'south-south-east',
  SSW: 'south-south-west', WSW: 'west-south-west', WNW: 'west-north-west', NNW: 'north-north-west',
};

export function compassPoint(deg: number): { short: string; long: string } {
  const short = POINTS[Math.round((((deg % 360) + 360) % 360) / 22.5) % 16];
  return { short, long: POINT_NAMES[short] };
}

/** Signed smallest difference a→b in degrees (-180, 180]. */
export function angleDiff(a: number, b: number): number {
  let d = (((b - a) % 360) + 360) % 360;
  if (d > 180) d -= 360;
  return d;
}
