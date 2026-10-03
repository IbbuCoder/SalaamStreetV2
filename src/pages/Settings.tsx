import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, ChevronRight, MapPin, Minus, Plus, Trash2 } from 'lucide-react';
import { PageHead } from '../components/PageHead';
import { LocationSetup } from '../components/LocationSetup';
import { ReadingSettings } from '../components/ReadingSettings';
import { useToast } from '../components/Toast';
import { useHashScroll } from '../hooks/useHashScroll';
import { formatCoords, locationLabel } from '../lib/location';
import { METHODS, PRAYER_KEYS, PRAYER_LABELS, recommendedMethod, methodInfo, SALAH_KEYS } from '../lib/prayer';
import type { HighLatitudeSetting, MethodKey, ThemeSetting } from '../lib/settings';
import { useSettings } from '../lib/SettingsContext';
import { clearAll } from '../lib/storage';
import { APP_VERSION } from '../content/roadmap';
import '../styles/settings.css';

export default function SettingsPage() {
  useHashScroll();
  return (
    <div className="page page--narrow">
      <PageHead title="Settings" sub="Everything is saved on this device. No account needed." />
      <LocationSection />
      <PrayerSection />
      <CalendarSection />
      <QuranSection />
      <AppearanceSection />
      <NotificationsSection />
      <GeneralSection />
    </div>
  );
}

function Group({ id, title, children, desc }: { id: string; title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="set-group" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="set-group__title">
        {title}
      </h2>
      {desc && <p className="set-group__desc">{desc}</p>}
      <div className="card set-card">{children}</div>
    </section>
  );
}

function Row({ children, stacked = false }: { children: React.ReactNode; stacked?: boolean }) {
  return <div className={`set-row${stacked ? ' set-row--stacked' : ''}`}>{children}</div>;
}

function Segmented<T extends string | number>({
  name,
  value,
  options,
  onChange,
  labelledBy,
}: {
  name: string;
  value: T;
  options: [T, string][];
  onChange: (v: T) => void;
  labelledBy: string;
}) {
  return (
    <div className="segmented" role="radiogroup" aria-labelledby={labelledBy}>
      {options.map(([v, label]) => (
        <label key={String(v)}>
          <input type="radio" name={name} checked={value === v} onChange={() => onChange(v)} />
          {label}
        </label>
      ))}
    </div>
  );
}

function LocationSection() {
  const { settings } = useSettings();
  const loc = settings.location;
  const [editing, setEditing] = useState(!loc);
  return (
    <Group id="location" title="Location" desc="Used to calculate prayer times and the Qibla direction.">
      {loc && !editing ? (
        <Row>
          <div className="set-row__label">
            <span className="inline-meta">
              <MapPin size={16} aria-hidden="true" /> <strong>{locationLabel(loc)}</strong>
            </span>
            <span className="hint">
              {formatCoords(loc.lat, loc.lng)} · {loc.tz.replace(/_/g, ' ')}
              {loc.source === 'device' && ' · from your device'}
            </span>
          </div>
          <button type="button" className="btn btn-sm" onClick={() => setEditing(true)}>
            Change
          </button>
        </Row>
      ) : (
        <div className="set-pad">
          <LocationSetup onDone={() => setEditing(false)} />
          {loc && (
            <button type="button" className="btn btn-ghost btn-sm cancel-btn" onClick={() => setEditing(false)}>
              Cancel
            </button>
          )}
        </div>
      )}
    </Group>
  );
}

function PrayerSection() {
  const { settings, update } = useSettings();
  const rec = settings.location ? recommendedMethod(settings.location.tz) : 'MuslimWorldLeague';
  const current = settings.method === 'auto' ? rec : settings.method;
  const adjusted = PRAYER_KEYS.some((k) => settings.adjustments[k] !== 0);

  return (
    <Group id="prayer" title="Prayer times">
      <Row stacked>
        <div className="field">
          <label htmlFor="method">Calculation method</label>
          <select
            id="method"
            className="select"
            value={settings.method}
            onChange={(e) => update({ method: e.target.value as 'auto' | MethodKey })}
          >
            <option value="auto">Automatic — {methodInfo(rec).name}</option>
            {METHODS.map((m) => (
              <option key={m.key} value={m.key}>
                {m.name}
              </option>
            ))}
          </select>
          <span className="hint">
            {methodInfo(current).detail}. Commonly used in: {methodInfo(current).region}. Methods differ mainly in Fajr and
            Isha — choose the one your local masjid uses.
          </span>
        </div>
      </Row>
      <Row stacked>
        <span className="label" id="asr-label">
          Asr time
        </span>
        <Segmented
          name="madhab"
          labelledBy="asr-label"
          value={settings.madhab}
          onChange={(v) => update({ madhab: v })}
          options={[
            ['shafi', 'Standard'],
            ['hanafi', 'Hanafi'],
          ]}
        />
        <span className="hint">Standard (Shafiʿi, Maliki, Hanbali): shadow equals object length. Hanafi: twice the length, so Asr is later.</span>
      </Row>
      <Row stacked>
        <span className="label" id="fmt-label">
          Time format
        </span>
        <Segmented
          name="timeFormat"
          labelledBy="fmt-label"
          value={settings.timeFormat}
          onChange={(v) => update({ timeFormat: v })}
          options={[
            ['12h', '12-hour'],
            ['24h', '24-hour'],
          ]}
        />
      </Row>
      <Row stacked>
        <div className="field">
          <label htmlFor="hlr">High-latitude rule</label>
          <select
            id="hlr"
            className="select"
            value={settings.highLatitude}
            onChange={(e) => update({ highLatitude: e.target.value as HighLatitudeSetting })}
          >
            <option value="auto">Automatic</option>
            <option value="middleofthenight">Middle of the night</option>
            <option value="seventhofthenight">One-seventh of the night</option>
            <option value="twilightangle">Twilight angle</option>
          </select>
          <span className="hint">Only matters far from the equator, where twilight can last all night in summer.</span>
        </div>
      </Row>
      <Row stacked>
        <div className="adj-head">
          <span className="label">Manual adjustments</span>
          {adjusted && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => update({ adjustments: { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 } })}
            >
              Reset
            </button>
          )}
        </div>
        <span className="hint">Add or subtract minutes to match your local masjid’s timetable.</span>
        <ul className="adj-list">
          {PRAYER_KEYS.map((k) => (
            <li key={k}>
              <span>{PRAYER_LABELS[k]}</span>
              <Stepper
                label={`${PRAYER_LABELS[k]} adjustment`}
                value={settings.adjustments[k]}
                min={-30}
                max={30}
                unit="min"
                onChange={(v) => update((s) => ({ adjustments: { ...s.adjustments, [k]: v } }))}
              />
            </li>
          ))}
        </ul>
      </Row>
    </Group>
  );
}

function Stepper({
  label,
  value,
  min,
  max,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <span className="stepper" role="group" aria-label={label}>
      <button type="button" aria-label={`Decrease ${label}`} disabled={value <= min} onClick={() => onChange(value - 1)}>
        <Minus size={16} aria-hidden="true" />
      </button>
      <output aria-live="polite">
        {value > 0 ? `+${value}` : value} {unit}
      </output>
      <button type="button" aria-label={`Increase ${label}`} disabled={value >= max} onClick={() => onChange(value + 1)}>
        <Plus size={16} aria-hidden="true" />
      </button>
    </span>
  );
}

function CalendarSection() {
  const { settings, update } = useSettings();
  return (
    <Group id="calendar" title="Hijri date">
      <Row>
        <div className="set-row__label">
          <span className="label">Day adjustment</span>
          <span className="hint">If your community’s moon sighting differs from the Umm al-Qura calendar.</span>
        </div>
        <Stepper
          label="Hijri day adjustment"
          value={settings.hijriOffset}
          min={-2}
          max={2}
          unit="d"
          onChange={(v) => update({ hijriOffset: v })}
        />
      </Row>
    </Group>
  );
}

function QuranSection() {
  return (
    <Group id="quran" title="Quran">
      <div className="set-pad">
        <ReadingSettings idPrefix="set" />
      </div>
    </Group>
  );
}

function AppearanceSection() {
  const { settings, update } = useSettings();
  return (
    <Group id="appearance" title="Appearance">
      <Row stacked>
        <span className="label" id="theme-label">
          Theme
        </span>
        <Segmented<ThemeSetting>
          name="theme"
          labelledBy="theme-label"
          value={settings.theme}
          onChange={(v) => update({ theme: v })}
          options={[
            ['system', 'System'],
            ['light', 'Light'],
            ['dark', 'Dark'],
          ]}
        />
      </Row>
    </Group>
  );
}

function NotificationsSection() {
  return (
    <Group id="notifications" title="Notifications">
      <Row stacked>
        <div className="soon">
          <Bell size={18} aria-hidden="true" />
          <span>
            Prayer reminders are planned for version 1.1. <Link to="/roadmap">See what’s coming</Link>
          </span>
        </div>
        <ul className="notif-list" aria-label="Prayer reminders (coming soon)">
          {SALAH_KEYS.map((k) => (
            <li key={k}>
              <label htmlFor={`n-${k}`}>{PRAYER_LABELS[k]} reminder</label>
              <span className="switch">
                <input id={`n-${k}`} type="checkbox" disabled aria-describedby="notif-soon" />
                <span />
              </span>
            </li>
          ))}
        </ul>
        <span id="notif-soon" className="hint">
          Not available yet.
        </span>
      </Row>
    </Group>
  );
}

function GeneralSection() {
  const { reset } = useSettings();
  const toast = useToast();
  const clear = () => {
    if (window.confirm('Delete all SalaamStreet data from this device? This removes your location, tracker history, bookmarks and preferences.')) {
      clearAll();
      window.location.assign(import.meta.env.BASE_URL);
    }
  };
  const resetPrefs = () => {
    if (window.confirm('Reset all preferences to their defaults? Your location, history and bookmarks are kept.')) {
      reset();
      toast('Preferences reset');
    }
  };
  return (
    <Group id="general" title="General">
      <Row>
        <div className="set-row__label">
          <label className="label" htmlFor="lang">
            Language
          </label>
          <span className="hint">More interface languages are planned. Quran translations are available in 7 languages.</span>
        </div>
        <select id="lang" className="select select--auto" defaultValue="en">
          <option value="en">English</option>
        </select>
      </Row>
      <LinkRow to="/about#privacy" label="Privacy" hint="What is stored and what is never collected" />
      <LinkRow to="/about" label="About SalaamStreet" hint={`Version ${APP_VERSION} · sources and credits`} />
      <LinkRow to="/roadmap" label="What’s coming" hint="The SalaamStreet roadmap" />
      <Row>
        <div className="set-row__label">
          <span className="label">Reset preferences</span>
          <span className="hint">Restore default settings</span>
        </div>
        <button type="button" className="btn btn-sm" onClick={resetPrefs}>
          Reset
        </button>
      </Row>
      <Row>
        <div className="set-row__label">
          <span className="label">Delete my data</span>
          <span className="hint">Remove everything SalaamStreet stores on this device</span>
        </div>
        <button type="button" className="btn btn-sm btn-danger" onClick={clear}>
          <Trash2 aria-hidden="true" /> Delete
        </button>
      </Row>
    </Group>
  );
}

function LinkRow({ to, label, hint }: { to: string; label: string; hint: string }) {
  return (
    <Link to={to} className="set-row set-row--link">
      <div className="set-row__label">
        <span className="label">{label}</span>
        <span className="hint">{hint}</span>
      </div>
      <ChevronRight size={18} aria-hidden="true" />
    </Link>
  );
}

