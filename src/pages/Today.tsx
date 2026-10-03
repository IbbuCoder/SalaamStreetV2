import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight, CircleDot, Compass, HandHeart, MapPin, CalendarDays } from 'lucide-react';
import { useMemo } from 'react';
import { PageHead } from '../components/PageHead';
import { LocationSetup } from '../components/LocationSetup';
import { NextPrayerCard, PrayerSchedule } from '../components/PrayerWidgets';
import { ErrorState } from '../components/States';
import { useNow } from '../hooks/useNow';
import { usePrayerState } from '../hooks/usePrayerState';
import { useToday } from '../hooks/useToday';
import { useTracker } from '../hooks/useTracker';
import { ISLAMIC_EVENTS } from '../content/islamicDates';
import { nextOccurrence } from '../lib/hijri';
import { lastReadStore } from '../lib/quran';
import { SALAH_KEYS, type PrayerState } from '../lib/prayer';
import { locationLabel } from '../lib/location';
import { useSettings } from '../lib/SettingsContext';
import { countDone } from '../lib/tracker';
import { dateKey, formatGregorian, civilToUTCNoon, type CivilDate } from '../lib/time';
import '../styles/prayer.css';
import '../styles/today.css';

export default function TodayPage() {
  const now = useNow(1000);
  const { settings } = useSettings();
  const today = useToday(now);
  const result = usePrayerState(now);
  const { log, toggle } = useTracker();
  const key = dateKey(today.date);
  const loc = settings.location;

  return (
    <div className="page">
      <PageHead
        docTitle="Today"
        eyebrow={
          loc ? (
            <Link to="/settings#location" className="loc-chip">
              <MapPin size={14} aria-hidden="true" />
              {locationLabel(loc)}
            </Link>
          ) : undefined
        }
        title={today.hijri ?? today.gregorian}
        sub={today.hijri ? today.gregorian : undefined}
      />

      <div className="today-grid">
        <div className="today-main">
          {result.status === 'no-location' && (
            <section className="card card-pad welcome" aria-labelledby="welcome-title">
              <h2 id="welcome-title">Welcome to SalaamStreet</h2>
              <p className="muted">Set your location to see accurate prayer times for where you are. It takes a moment and stays on your device.</p>
              <LocationSetup compact />
            </section>
          )}
          {result.status === 'error' && (
            <div className="card">
              <ErrorState title="Prayer times unavailable" message={result.message}>
                <Link className="btn" to="/settings">
                  Open settings
                </Link>
              </ErrorState>
            </div>
          )}
          {result.status === 'ok' && loc && (
            <>
              <NextPrayerCard state={result.state} now={now} tz={loc.tz} />
              <section className="card section-tight" aria-labelledby="schedule-title">
                <div className="card-head">
                  <h2 id="schedule-title">Today’s prayers</h2>
                  <ProgressPill done={countDone(log[key])} />
                </div>
                <PrayerSchedule state={result.state} now={now} tz={loc.tz} log={log[key]} onToggle={(p) => toggle(key, p)} />
                <p className="card-foot tiny muted">
                  Tap the circle to mark a prayer: ✓ completed, — missed. <Link to="/tracker">View history</Link>
                </p>
              </section>
            </>
          )}
        </div>

        <aside className="today-side" aria-label="Quick access">
          <QuickAccess />
          <ContinueReading />
          <AdhkarNow state={result.status === 'ok' ? result.state : null} now={now} />
          <NextIslamicDate from={today.date} offset={settings.hijriOffset} />
        </aside>
      </div>
    </div>
  );
}

function ProgressPill({ done }: { done: number }) {
  return (
    <span className="progress-pill" aria-label={`${done} of 5 prayers completed`}>
      <span className="progress-dots" aria-hidden="true">
        {SALAH_KEYS.map((k, i) => (
          <span key={k} className={i < done ? 'on' : ''} />
        ))}
      </span>
      {done}/5
    </span>
  );
}

const QUICK = [
  { to: '/quran', label: 'Quran', icon: BookOpen },
  { to: '/qibla', label: 'Qibla', icon: Compass },
  { to: '/duas', label: 'Duas', icon: HandHeart },
  { to: '/tasbih', label: 'Tasbih', icon: CircleDot },
];

function QuickAccess() {
  return (
    <nav className="quick" aria-label="Quick access">
      {QUICK.map((q) => (
        <Link key={q.to} to={q.to} className="quick__item">
          <span className="tile-icon">
            <q.icon aria-hidden="true" />
          </span>
          {q.label}
        </Link>
      ))}
    </nav>
  );
}

function ContinueReading() {
  const last = lastReadStore.use();
  if (!last) return null;
  return (
    <Link to={`/quran/${last.surah}?ayah=${last.ayah}`} className="card side-card">
      <span className="tile-icon">
        <BookOpen aria-hidden="true" />
      </span>
      <span className="side-card__text">
        <span className="side-card__k">Continue reading</span>
        <span className="side-card__v">
          {last.name ?? `Surah ${last.surah}`} · verse {last.ayah}
        </span>
      </span>
      <ChevronRight className="chev" aria-hidden="true" />
    </Link>
  );
}

function AdhkarNow({ state, now }: { state: PrayerState | null; now: Date }) {
  let pick = { to: '/duas/general', k: 'Duas for every day', v: 'From the Quran and Sunnah' };
  if (state) {
    const t = state.today.times;
    if (now >= t.fajr && now < t.dhuhr) pick = { to: '/duas/morning', k: 'Morning adhkar', v: 'Start your day with remembrance' };
    else if (now >= t.asr && now < t.isha) pick = { to: '/duas/evening', k: 'Evening adhkar', v: 'Remembrance for the evening' };
    else if (now >= t.isha || now < t.fajr) pick = { to: '/duas/sleep', k: 'Before sleeping', v: 'Ayat al-Kursi and more' };
  }
  return (
    <Link to={pick.to} className="card side-card">
      <span className="tile-icon tile-icon--accent">
        <HandHeart aria-hidden="true" />
      </span>
      <span className="side-card__text">
        <span className="side-card__k">{pick.k}</span>
        <span className="side-card__v">{pick.v}</span>
      </span>
      <ChevronRight className="chev" aria-hidden="true" />
    </Link>
  );
}

function NextIslamicDate({ from, offset }: { from: CivilDate; offset: number }) {
  const fromKey = dateKey(from);
  const upcoming = useMemo(() => {
    let best: { name: string; date: CivilDate } | null = null;
    // Only widely agreed dates here; debated observances are listed on the calendar page.
    for (const e of ISLAMIC_EVENTS.filter((x) => !x.caution)) {
      const d = nextOccurrence(from, e.month, e.day, offset);
      if (d && (!best || civilToUTCNoon(d) < civilToUTCNoon(best.date))) best = { name: e.name, date: d };
    }
    return best;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromKey, offset]);
  if (!upcoming) return null;
  const days = Math.round((civilToUTCNoon(upcoming.date).getTime() - civilToUTCNoon(from).getTime()) / 86400000);
  return (
    <Link to="/calendar" className="card side-card">
      <span className="tile-icon">
        <CalendarDays aria-hidden="true" />
      </span>
      <span className="side-card__text">
        <span className="side-card__k">{upcoming.name}</span>
        <span className="side-card__v">
          {days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `In ${days} days`} · {formatGregorian(upcoming.date, 'short')}
        </span>
      </span>
      <ChevronRight className="chev" aria-hidden="true" />
    </Link>
  );
}
