import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Settings2 } from 'lucide-react';
import { PageHead } from '../components/PageHead';
import { LocationSetup } from '../components/LocationSetup';
import { NextPrayerCard, PrayerSchedule } from '../components/PrayerWidgets';
import { ErrorState } from '../components/States';
import { useNow } from '../hooks/useNow';
import { usePrayerState } from '../hooks/usePrayerState';
import { computeDay, isScheduleValid, methodInfo, PRAYER_KEYS, PRAYER_LABELS } from '../lib/prayer';
import { locationLabel } from '../lib/location';
import { useSettings } from '../lib/SettingsContext';
import { addDays, civilDateIn, civilToUTCNoon, dateKey, formatTime, formatUtcOffset } from '../lib/time';
import '../styles/prayer.css';

export default function PrayerPage() {
  const now = useNow(1000);
  const { settings } = useSettings();
  const result = usePrayerState(now);
  const loc = settings.location;

  if (!loc || result.status === 'no-location') {
    return (
      <div className="page page--narrow">
        <PageHead title="Prayer times" sub="Choose your location to calculate today’s prayer times." />
        <div className="card card-pad">
          <LocationSetup />
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHead
        title="Prayer times"
        sub={
          <span className="inline-meta">
            <MapPin size={15} aria-hidden="true" /> {locationLabel(loc)}
          </span>
        }
        actions={
          <Link to="/settings#prayer" className="btn btn-sm">
            <Settings2 aria-hidden="true" /> Adjust
          </Link>
        }
      />

      {result.status === 'error' ? (
        <div className="card">
          <ErrorState title="Prayer times unavailable" message={result.message}>
            <Link className="btn" to="/settings#prayer">
              Calculation settings
            </Link>
          </ErrorState>
        </div>
      ) : (
        <div className="grid-2">
          <div className="stack">
            <NextPrayerCard state={result.state} now={now} tz={loc.tz} />
            <div className="card">
              <PrayerSchedule state={result.state} now={now} tz={loc.tz} />
            </div>
          </div>
          <div className="stack">
            <section className="card card-pad calc-info" aria-labelledby="calc-title">
              <h2 id="calc-title" className="h-small">
                How these times are calculated
              </h2>
              <dl className="meta-list">
                <div>
                  <dt>Method</dt>
                  <dd>
                    {methodInfo(result.state.today.method).name}
                    {settings.method === 'auto' && <span className="badge">Recommended</span>}
                    <span className="muted small">{methodInfo(result.state.today.method).detail}</span>
                  </dd>
                </div>
                <div>
                  <dt>Asr</dt>
                  <dd>{settings.madhab === 'hanafi' ? 'Hanafi (later)' : 'Standard — Shafiʿi, Maliki, Hanbali'}</dd>
                </div>
                <div>
                  <dt>Time zone</dt>
                  <dd>
                    {loc.tz.replace(/_/g, ' ')} <span className="muted small">{formatUtcOffset(now, loc.tz)}</span>
                  </dd>
                </div>
                <div>
                  <dt>Night</dt>
                  <dd>
                    Middle {formatTime(result.state.today.middleOfNight, loc.tz, settings.timeFormat)} · Last third{' '}
                    {formatTime(result.state.today.lastThird, loc.tz, settings.timeFormat)}
                  </dd>
                </div>
              </dl>
              <p className="tiny muted">
                Times are calculated on your device from your location, so they work offline. Your local masjid may use a
                different method or add a few minutes — you can match it in <Link to="/settings#prayer">Settings</Link>.
              </p>
            </section>
            <WeekTable />
          </div>
        </div>
      )}
    </div>
  );
}

function WeekTable() {
  const { settings } = useSettings();
  const loc = settings.location!;
  const now = useNow(60000);
  const todayKey = dateKey(civilDateIn(now, loc.tz));
  const rows = useMemo(() => {
    const start = civilDateIn(new Date(), loc.tz);
    return Array.from({ length: 7 }, (_, i) => computeDay(loc, addDays(start, i), settings));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loc, todayKey, settings.method, settings.madhab, settings.highLatitude, settings.adjustments]);
  const short = (d: Date) => formatTime(d, loc.tz, settings.timeFormat).replace(/\s?[AP]M$/i, '');
  const dayFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', weekday: 'short', day: 'numeric' });

  return (
    <section className="card week" aria-labelledby="week-title">
      <h2 id="week-title" className="h-small card-head-pad">
        The next 7 days
      </h2>
      <div className="table-wrap">
        <table className="week-table">
          <thead>
            <tr>
              <th scope="col">Day</th>
              {PRAYER_KEYS.map((k) => (
                <th scope="col" key={k}>
                  {k === 'sunrise' ? 'Sunrise' : PRAYER_LABELS[k]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={dateKey(r.date)} className={i === 0 ? 'is-today' : ''}>
                <th scope="row">{i === 0 ? 'Today' : dayFmt.format(civilToUTCNoon(r.date))}</th>
                {PRAYER_KEYS.map((k) => (
                  <td key={k}>{isScheduleValid(r) ? short(r.times[k]) : '—'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {settings.timeFormat === '12h' && <p className="tiny muted card-foot-pad">Fajr and Sunrise are AM; the rest are PM.</p>}
    </section>
  );
}

