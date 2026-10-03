import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Compass, MapPin, Smartphone } from 'lucide-react';
import { PageHead } from '../components/PageHead';
import { LocationSetup } from '../components/LocationSetup';
import { useCompass } from '../hooks/useCompass';
import { angleDiff, compassPoint, distanceToKaaba, qiblaBearing } from '../lib/qibla';
import { locationLabel } from '../lib/location';
import { useSettings } from '../lib/SettingsContext';
import '../styles/qibla.css';

export default function QiblaPage() {
  const { settings } = useSettings();
  const loc = settings.location;

  if (!loc) {
    return (
      <div className="page page--narrow">
        <PageHead title="Qibla" sub="Set your location to find the direction of the Kaʿbah." />
        <div className="card card-pad">
          <LocationSetup />
        </div>
      </div>
    );
  }

  return <QiblaView lat={loc.lat} lng={loc.lng} label={locationLabel(loc)} />;
}

function QiblaView({ lat, lng, label }: { lat: number; lng: number; label: string }) {
  const { settings } = useSettings();
  const bearing = qiblaBearing(lat, lng);
  const km = distanceToKaaba(lat, lng);
  const point = compassPoint(bearing);
  const { status, heading, start, stop } = useCompass();
  const live = status === 'active' && heading != null;

  // Unwrap the dial rotation so it never spins the long way round at 0°/360°.
  const rot = useRef(0);
  if (live) rot.current = rot.current + angleDiff(rot.current, -heading!);
  else rot.current = 0;

  const turn = live ? angleDiff(heading!, bearing) : 0;
  const aligned = live && Math.abs(turn) <= 4;

  const wasAligned = useRef(false);
  useEffect(() => {
    if (aligned && !wasAligned.current && settings.haptics && navigator.vibrate) {
      try {
        navigator.vibrate(30);
      } catch {
        /* ignore */
      }
    }
    wasAligned.current = aligned;
  }, [aligned, settings.haptics]);

  return (
    <div className="page">
      <PageHead
        title="Qibla"
        sub={
          <span className="inline-meta">
            <MapPin size={15} aria-hidden="true" /> {label}
          </span>
        }
      />
      <div className="qibla-layout">
        <section className="card qibla-card" aria-labelledby="qibla-reading">
          <div className={`dial-wrap${aligned ? ' is-aligned' : ''}`}>
            <div className="dial-pointer" aria-hidden="true" />
            <svg
              className="dial"
              viewBox="0 0 300 300"
              role="img"
              aria-label={`Compass showing the Qibla at ${Math.round(bearing)} degrees from north`}
              style={{ transform: `rotate(${rot.current}deg)` }}
            >
              <circle cx="150" cy="150" r="140" className="dial-face" />
              {Array.from({ length: 72 }, (_, i) => {
                const major = i % 18 === 0;
                const mid = i % 6 === 0;
                return (
                  <line
                    key={i}
                    x1="150"
                    y1={major ? 16 : mid ? 18 : 20}
                    x2="150"
                    y2={major ? 34 : mid ? 30 : 26}
                    className={major ? 'tick tick--major' : 'tick'}
                    transform={`rotate(${i * 5} 150 150)`}
                  />
                );
              })}
              {(['N', 'E', 'S', 'W'] as const).map((d, i) => (
                <text key={d} x="150" y="56" className={`cardinal${d === 'N' ? ' cardinal--n' : ''}`} transform={`rotate(${i * 90} 150 150)`}>
                  {d}
                </text>
              ))}
              <g transform={`rotate(${bearing} 150 150)`}>
                <line x1="150" y1="150" x2="150" y2="62" className="qibla-line" />
                <g transform="translate(150 50)">
                  <rect x="-13" y="-13" width="26" height="26" rx="3" className="kaaba" />
                  <rect x="-13" y="-7" width="26" height="4" className="kaaba-band" />
                </g>
              </g>
              <circle cx="150" cy="150" r="6" className="dial-hub" />
            </svg>
          </div>

          <div className="qibla-reading" id="qibla-reading" aria-live="polite">
            {live ? (
              aligned ? (
                <p className="qibla-big qibla-ok">You are facing the Qibla</p>
              ) : (
                <p className="qibla-big">
                  Turn {turn > 0 ? 'right' : 'left'} {Math.abs(Math.round(turn))}°
                </p>
              )
            ) : (
              <p className="qibla-big">
                {Math.round(bearing)}° <span className="qibla-point">{point.short}</span>
              </p>
            )}
            <p className="muted">
              The Qibla is {Math.round(bearing)}° from true north ({point.long}). The Kaʿbah is{' '}
              {km.toLocaleString('en', { maximumFractionDigits: 0 })} km away.
            </p>
          </div>

          <div className="qibla-actions">
            {live ? (
              <button type="button" className="btn" onClick={stop}>
                Stop compass
              </button>
            ) : (
              <button type="button" className="btn btn-primary" onClick={start} disabled={status === 'requesting'}>
                <Compass aria-hidden="true" />
                {status === 'requesting' ? 'Starting compass…' : 'Use device compass'}
              </button>
            )}
            {status === 'denied' && (
              <p className="alert" role="alert">
                Motion &amp; orientation access was denied. You can still use the bearing above with a separate compass.
              </p>
            )}
            {(status === 'unsupported' || status === 'no-reading') && (
              <p className="alert" role="alert">
                <Smartphone aria-hidden="true" />
                <span>
                  No compass sensor was found. On a laptop or desktop, use the bearing above: {Math.round(bearing)}° from north
                  ({point.long}).
                </span>
              </p>
            )}
          </div>
        </section>

        <section className="card card-pad qibla-help" aria-labelledby="help-title">
          <h2 id="help-title" className="h-small">
            Getting an accurate reading
          </h2>
          <ol className="help-steps">
            <li>Hold your phone flat, screen facing up, in front of you.</li>
            <li>Move away from metal objects, magnets, speakers and other electronics.</li>
            <li>
              If the reading jumps around, calibrate by moving the phone in a slow figure-of-eight a few times.
            </li>
            <li>Turn your body until the Kaʿbah marker reaches the pointer at the top of the dial.</li>
          </ol>
          <p className="tiny muted">
            Phone compasses can be off by several degrees, and they point to magnetic north, which differs slightly from true
            north in most places. For important uses, confirm with your local masjid. The direction is calculated on your
            device along the great-circle (shortest) path to the Kaʿbah.
          </p>
          <p className="tiny muted">
            Wrong place? <Link to="/settings#location">Change your location</Link>.
          </p>
        </section>
      </div>
    </div>
  );
}
