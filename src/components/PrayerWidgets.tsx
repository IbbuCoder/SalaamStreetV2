import { Check, Minus, Circle } from 'lucide-react';
import { PRAYER_ARABIC, PRAYER_KEYS, PRAYER_LABELS, type PrayerState, type SalahKey } from '../lib/prayer';
import type { DayLog, PrayerStatus } from '../lib/tracker';
import { formatDuration, formatDurationLong, formatTime } from '../lib/time';
import { useSettings } from '../lib/SettingsContext';

export function NextPrayerCard({ state, now, tz }: { state: PrayerState; now: Date; tz: string }) {
  const { settings } = useSettings();
  const { next } = state;
  const remaining = next.time.getTime() - now.getTime();
  return (
    <section className="next-card" aria-labelledby="next-prayer-label">
      <div className="next-card__pattern" aria-hidden="true" />
      <p id="next-prayer-label" className="next-card__label">
        Next prayer{next.tomorrow ? ' · tomorrow' : ''}
      </p>
      <div className="next-card__row">
        <h2 className="next-card__name">
          {PRAYER_LABELS[next.key]}
          <span className="arabic next-card__ar" lang="ar">
            {PRAYER_ARABIC[next.key]}
          </span>
        </h2>
        <p className="next-card__time">{formatTime(next.time, tz, settings.timeFormat)}</p>
      </div>
      <p className="next-card__countdown">
        <span aria-hidden="true">{formatDuration(remaining)}</span>
        <span className="visually-hidden">in {formatDurationLong(remaining)}</span>
        <span className="next-card__remaining"> remaining</span>
      </p>
    </section>
  );
}

const STATUS_TEXT: Record<'done' | 'missed' | 'none', string> = {
  done: 'Completed',
  missed: 'Missed',
  none: 'Not marked',
};

export function StatusIcon({ status }: { status?: PrayerStatus }) {
  if (status === 'done') return <Check aria-hidden="true" strokeWidth={3} />;
  if (status === 'missed') return <Minus aria-hidden="true" strokeWidth={3} />;
  return <Circle aria-hidden="true" />;
}

export function TrackButton({
  prayer,
  status,
  disabled,
  onToggle,
  showText = false,
}: {
  prayer: SalahKey;
  status?: PrayerStatus;
  disabled?: boolean;
  onToggle: () => void;
  showText?: boolean;
}) {
  const label = disabled
    ? `${PRAYER_LABELS[prayer]}: not yet time`
    : `${PRAYER_LABELS[prayer]}: ${STATUS_TEXT[status ?? 'none']}. Tap to change.`;
  return (
    <button
      type="button"
      className={`track-btn track-btn--${status ?? 'none'}${showText ? ' track-btn--text' : ''}`}
      onClick={onToggle}
      disabled={disabled}
      aria-label={label}
      title={label}
    >
      <StatusIcon status={status} />
      {showText && <span aria-hidden="true">{disabled ? 'Later' : STATUS_TEXT[status ?? 'none']}</span>}
    </button>
  );
}

/**
 * Today's schedule. When `log`/`onToggle` are given, each prayer gets a one-tap
 * tracker control (✓ completed / — missed / ○ not marked).
 */
export function PrayerSchedule({
  state,
  now,
  tz,
  log,
  onToggle,
}: {
  state: PrayerState;
  now: Date;
  tz: string;
  log?: DayLog;
  onToggle?: (p: SalahKey) => void;
}) {
  const { settings } = useSettings();
  const { today, next } = state;
  return (
    <ol className="schedule" aria-label="Today’s prayer times">
      {PRAYER_KEYS.map((key) => {
        const time = today.times[key];
        const isNext = !next.tomorrow && next.key === key;
        const passed = time <= now;
        const isSalah = key !== 'sunrise';
        return (
          <li
            key={key}
            className={`schedule__row${isNext ? ' is-next' : ''}${passed ? ' is-passed' : ''}${!isSalah ? ' is-marker' : ''}`}
            aria-current={isNext ? 'time' : undefined}
          >
            <span className="schedule__name">
              {PRAYER_LABELS[key]}
              {isNext && <span className="badge badge--primary schedule__badge">Next</span>}
            </span>
            <span className="schedule__time">{formatTime(time, tz, settings.timeFormat)}</span>
            {onToggle && (
              <span className="schedule__track">
                {isSalah ? (
                  <TrackButton
                    prayer={key as SalahKey}
                    status={log?.[key as SalahKey]}
                    disabled={!passed}
                    onToggle={() => onToggle(key as SalahKey)}
                  />
                ) : null}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
