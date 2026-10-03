import { Link } from 'react-router-dom';
import { History } from 'lucide-react';
import { PageHead } from '../components/PageHead';
import { StatusIcon, TrackButton } from '../components/PrayerWidgets';
import { EmptyState } from '../components/States';
import { useNow } from '../hooks/useNow';
import { usePrayerState } from '../hooks/usePrayerState';
import { useToday } from '../hooks/useToday';
import { useTracker } from '../hooks/useTracker';
import { PRAYER_LABELS, SALAH_KEYS } from '../lib/prayer';
import { useSettings } from '../lib/SettingsContext';
import { countDone, type PrayerStatus } from '../lib/tracker';
import { addDays, civilToUTCNoon, dateKey, formatTime } from '../lib/time';
import '../styles/prayer.css';
import '../styles/tracker.css';

const HISTORY_DAYS = 14;
const dayFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', weekday: 'short', day: 'numeric', month: 'short' });

export default function TrackerPage() {
  const now = useNow(30000);
  const { settings } = useSettings();
  const today = useToday(now);
  const result = usePrayerState(now);
  const { log, toggle } = useTracker();
  const key = dateKey(today.date);
  const done = countDone(log[key]);
  const times = result.status === 'ok' ? result.state.today.times : null;

  const history = Array.from({ length: HISTORY_DAYS }, (_, i) => addDays(today.date, -(i + 1)));
  const hasHistory = history.some((d) => log[dateKey(d)] && Object.keys(log[dateKey(d)]).length > 0);
  const week = Array.from({ length: 7 }, (_, i) => addDays(today.date, -i)).reduce((n, d) => n + countDone(log[dateKey(d)]), 0);

  return (
    <div className="page page--narrow">
      <PageHead title="Prayer tracker" sub="A simple record of your five daily prayers, kept on this device." />

      <section className="card" aria-labelledby="today-title">
        <div className="tracker-head">
          <div>
            <h2 id="today-title" className="h-small">
              Today
            </h2>
            <p className="muted small">{today.gregorian}</p>
          </div>
          <div className="tracker-progress" role="img" aria-label={`${done} of 5 prayers completed today`}>
            <svg viewBox="0 0 36 36" aria-hidden="true">
              <circle cx="18" cy="18" r="15.5" className="ring-bg" />
              <circle cx="18" cy="18" r="15.5" className="ring-fg" strokeDasharray={`${(done / 5) * 97.4} 97.4`} />
            </svg>
            <span>
              {done}
              <small>/5</small>
            </span>
          </div>
        </div>
        <ul className="tracker-list">
          {SALAH_KEYS.map((p) => {
            const notYet = times ? times[p] > now : false;
            return (
              <li key={p}>
                <div>
                  <span className="tracker-name">{PRAYER_LABELS[p]}</span>
                  {times && settings.location && (
                    <span className="muted small"> · {formatTime(times[p], settings.location.tz, settings.timeFormat)}</span>
                  )}
                </div>
                <TrackButton prayer={p} status={log[key]?.[p]} disabled={notYet} onToggle={() => toggle(key, p)} showText />
              </li>
            );
          })}
        </ul>
        <p className="tiny muted card-foot-pad">
          Tap to cycle: not marked → ✓ completed → — missed. {!settings.location && <>Set a <Link to="/settings#location">location</Link> to see prayer times here.</>}
        </p>
      </section>

      <section className="section" aria-labelledby="history-title">
        <div className="section-title">
          <h2 id="history-title">Last {HISTORY_DAYS} days</h2>
          <span className="muted small">{week} of 35 this week</span>
        </div>
        <div className="card">
          {hasHistory ? (
            <div className="table-wrap">
              <table className="history-table">
                <thead>
                  <tr>
                    <th scope="col">Day</th>
                    {SALAH_KEYS.map((p) => (
                      <th scope="col" key={p}>
                        <abbr title={PRAYER_LABELS[p]}>{PRAYER_LABELS[p].slice(0, 3)}</abbr>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.map((d) => {
                    const k = dateKey(d);
                    return (
                      <tr key={k}>
                        <th scope="row">{dayFmt.format(civilToUTCNoon(d))}</th>
                        {SALAH_KEYS.map((p) => (
                          <td key={p}>
                            <HistoryCell status={log[k]?.[p]} label={`${PRAYER_LABELS[p]} on ${dayFmt.format(civilToUTCNoon(d))}`} onToggle={() => toggle(k, p)} />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={<History aria-hidden="true" />}
              title="No history yet"
              message="As you mark prayers each day, the last two weeks will appear here. You can also tap a past day to correct it."
            />
          )}
        </div>
        {hasHistory && <p className="tiny muted history-note">Forgot to mark a prayer? Tap any cell to update it.</p>}
      </section>
    </div>
  );
}

function HistoryCell({ status, label, onToggle }: { status?: PrayerStatus; label: string; onToggle: () => void }) {
  const text = status === 'done' ? 'completed' : status === 'missed' ? 'missed' : 'not marked';
  return (
    <button type="button" className={`hist-cell hist-cell--${status ?? 'none'}`} onClick={onToggle} aria-label={`${label}: ${text}. Tap to change.`}>
      <StatusIcon status={status} />
    </button>
  );
}
