import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { PageHead } from '../components/PageHead';
import { ErrorState } from '../components/States';
import { ISLAMIC_EVENTS } from '../content/islamicDates';
import { useNow } from '../hooks/useNow';
import { useToday } from '../hooks/useToday';
import { HIJRI_MONTHS, HIJRI_MONTHS_AR, hijriMonthOf, hijriSupported, nextOccurrence } from '../lib/hijri';
import { useSettings } from '../lib/SettingsContext';
import { addDays, civilToUTCNoon, dateKey, formatGregorian, type CivilDate } from '../lib/time';
import '../styles/calendar.css';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', month: 'short', year: 'numeric' });
const longFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

export default function CalendarPage() {
  const now = useNow(60000);
  const today = useToday(now);
  const { settings } = useSettings();
  const offset = settings.hijriOffset;
  const [shift, setShift] = useState(0);

  const month = useMemo(() => {
    let anchor: CivilDate = today.date;
    let days = hijriMonthOf(anchor, offset);
    for (let i = 0; i < Math.abs(shift) && days; i++) {
      anchor = shift > 0 ? addDays(days[days.length - 1].date, 1) : addDays(days[0].date, -1);
      days = hijriMonthOf(anchor, offset);
    }
    return days;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateKey(today.date), offset, shift]);

  if (!hijriSupported() || !month) {
    return (
      <div className="page page--narrow">
        <PageHead title="Hijri calendar" />
        <div className="card">
          <ErrorState
            title="Hijri dates are not supported in this browser"
            message="Your browser does not include the Islamic (Umm al-Qura) calendar. Please update your browser or try another one."
          />
        </div>
      </div>
    );
  }

  const first = month[0];
  const last = month[month.length - 1];
  const todayKey = dateKey(today.date);
  const lead = civilToUTCNoon(first.date).getUTCDay();
  const events = new Map(ISLAMIC_EVENTS.filter((e) => e.month === first.hijri.m).map((e) => [e.day, e]));
  const gregRange =
    monthFmt.format(civilToUTCNoon(first.date)) === monthFmt.format(civilToUTCNoon(last.date))
      ? monthFmt.format(civilToUTCNoon(first.date))
      : `${monthFmt.format(civilToUTCNoon(first.date))} – ${monthFmt.format(civilToUTCNoon(last.date))}`;

  return (
    <div className="page">
      <PageHead title="Hijri calendar" eyebrow={today.hijri} sub={today.gregorian} />

      <div className="cal-layout">
        <section className="card cal" aria-labelledby="cal-title">
          <div className="cal__head">
            <button type="button" className="icon-btn" onClick={() => setShift((s) => s - 1)} aria-label="Previous month">
              <ChevronLeft aria-hidden="true" />
            </button>
            <div className="cal__title">
              <h2 id="cal-title">
                {HIJRI_MONTHS[first.hijri.m - 1]} {first.hijri.y}
              </h2>
              <p className="muted small">
                <span className="arabic cal__ar" lang="ar">
                  {HIJRI_MONTHS_AR[first.hijri.m - 1]}
                </span>{' '}
                · {gregRange}
              </p>
            </div>
            <button type="button" className="icon-btn" onClick={() => setShift((s) => s + 1)} aria-label="Next month">
              <ChevronRight aria-hidden="true" />
            </button>
          </div>
          {shift !== 0 && (
            <button type="button" className="btn btn-sm btn-ghost cal__today" onClick={() => setShift(0)}>
              Back to this month
            </button>
          )}
          <div className="cal__grid" role="grid" aria-labelledby="cal-title">
            <div role="row" className="cal__row cal__row--head">
              {WEEKDAYS.map((w) => (
                <span role="columnheader" key={w} className={w === 'Fri' ? 'is-fri' : ''}>
                  {w}
                </span>
              ))}
            </div>
            {chunk([...Array(lead).fill(null), ...month], 7).map((week, wi) => (
              <div role="row" className="cal__row" key={wi}>
                {week.map((d, i) => {
                  if (!d) return <span role="gridcell" key={`e${i}`} className="cal__cell is-empty" />;
                  const ev = events.get(d.hijri.d);
                  const isToday = dateKey(d.date) === todayKey;
                  return (
                    <span
                      role="gridcell"
                      key={d.hijri.d}
                      className={`cal__cell${isToday ? ' is-today' : ''}${ev ? ' has-event' : ''}`}
                      aria-current={isToday ? 'date' : undefined}
                      aria-label={`${d.hijri.d} ${HIJRI_MONTHS[d.hijri.m - 1]}, ${longFmt.format(civilToUTCNoon(d.date))}${ev ? `, ${ev.name}` : ''}${isToday ? ', today' : ''}`}
                      title={ev?.name}
                    >
                      <span className="cal__h" aria-hidden="true">
                        {d.hijri.d}
                      </span>
                      <span className="cal__g" aria-hidden="true">
                        {d.date.d}
                      </span>
                      {ev && <span className="cal__dot" aria-hidden="true" />}
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
          {events.size > 0 && (
            <ul className="cal__legend">
              {[...events.values()].map((e) => (
                <li key={e.id}>
                  <span className="cal__dot" aria-hidden="true" /> {e.day} {HIJRI_MONTHS[e.month - 1]} — {e.name}
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="stack">
          <UpcomingDates from={today.date} offset={offset} />
          <p className="alert">
            <Info aria-hidden="true" />
            <span>
              Dates use the Umm al-Qura calendar. The start of each month can differ by a day where you live, depending on
              the moon sighting. You can shift dates in <Link to="/settings#calendar">Settings</Link>
              {offset !== 0 && ` (currently ${offset > 0 ? '+' : ''}${offset} day${Math.abs(offset) === 1 ? '' : 's'})`}.
            </span>
          </p>
        </div>
      </div>

      <section className="section" aria-labelledby="months-title">
        <div className="section-title">
          <h2 id="months-title">The Islamic months</h2>
        </div>
        <ol className="months">
          {HIJRI_MONTHS.map((m, i) => (
            <li key={m} className={i + 1 === first.hijri.m && shift === 0 ? 'is-current' : ''}>
              <span className="months__n">{i + 1}</span>
              <span className="months__name">{m}</span>
              <span className="arabic months__ar" lang="ar">
                {HIJRI_MONTHS_AR[i]}
              </span>
              {[1, 7, 11, 12].includes(i + 1) && <span className="badge badge--accent">Sacred</span>}
              {i + 1 === 9 && <span className="badge badge--primary">Fasting</span>}
            </li>
          ))}
        </ol>
        <p className="tiny muted">
          Muharram, Rajab, Dhu al-Qaʿdah and Dhu al-Hijjah are the four sacred months (Quran 9:36; Sahih al-Bukhari 4662).
        </p>
      </section>
    </div>
  );
}

function UpcomingDates({ from, offset }: { from: CivilDate; offset: number }) {
  const key = dateKey(from);
  const items = useMemo(
    () =>
      ISLAMIC_EVENTS.map((e) => ({ e, date: nextOccurrence(from, e.month, e.day, offset) }))
        .filter((x): x is { e: (typeof ISLAMIC_EVENTS)[number]; date: CivilDate } => x.date != null)
        .sort((a, b) => civilToUTCNoon(a.date).getTime() - civilToUTCNoon(b.date).getTime()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key, offset],
  );
  return (
    <section className="card" aria-labelledby="upcoming-title">
      <h2 id="upcoming-title" className="h-small card-head-pad">
        Important dates
      </h2>
      <ol className="events">
        {items.map(({ e, date }) => {
          const days = Math.round((civilToUTCNoon(date).getTime() - civilToUTCNoon(from).getTime()) / 86400000);
          return (
            <li key={e.id}>
              <div className="events__when">
                <span className="events__date">{formatGregorian(date, 'short')}</span>
                <span className="events__in">{days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `in ${days} days`}</span>
              </div>
              <div>
                <p className="events__name">{e.name}</p>
                <p className="events__h">
                  {e.day} {HIJRI_MONTHS[e.month - 1]}
                </p>
                <p className="events__desc">{e.description}</p>
                {e.caution && <p className="events__caution">{e.caution}</p>}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function chunk<T>(arr: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}
