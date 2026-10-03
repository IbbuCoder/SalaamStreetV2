import { useEffect } from 'react';
import { RotateCcw, Vibrate } from 'lucide-react';
import { PageHead } from '../components/PageHead';
import { useToast } from '../components/Toast';
import { DHIKR } from '../content/dhikr';
import { createPersistedStore } from '../lib/store';
import { useSettings } from '../lib/SettingsContext';
import '../styles/tasbih.css';

interface TasbihState {
  selected: string;
  counts: Record<string, number>;
  targets: Record<string, number>; // 0 = no target
}

const store = createPersistedStore<TasbihState>('tasbih', { selected: DHIKR[0].id, counts: {}, targets: {} });
const TARGETS = [0, 33, 99, 100];

function buzz(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* unsupported */
  }
}

export default function TasbihPage() {
  const state = store.use();
  const { settings, update } = useSettings();
  const toast = useToast();
  const dhikr = DHIKR.find((d) => d.id === state.selected) ?? DHIKR[0];
  const count = state.counts[dhikr.id] ?? 0;
  const target = state.targets[dhikr.id] ?? dhikr.target;
  const inRound = target ? count % target : count;
  const rounds = target ? Math.floor(count / target) : 0;
  const progress = target ? (count > 0 && inRound === 0 ? 1 : inRound / target) : 0;
  const canVibrate = typeof navigator !== 'undefined' && 'vibrate' in navigator;

  const increment = () => {
    const next = count + 1;
    store.set((s) => ({ ...s, counts: { ...s.counts, [dhikr.id]: next } }));
    if (settings.haptics) buzz(target && next % target === 0 ? [40, 60, 40] : 10);
  };

  const reset = () => {
    if (count === 0) return;
    store.set((s) => ({ ...s, counts: { ...s.counts, [dhikr.id]: 0 } }));
    toast(`Counter reset (was ${count})`);
  };

  const setTarget = (t: number) => store.set((s) => ({ ...s, targets: { ...s.targets, [dhikr.id]: t } }));

  // Keyboard: space / enter / + on the page count too (when not typing in a field).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (el.closest('input, select, textarea, button, a, [role="radio"]')) return;
      if (e.key === ' ' || e.key === 'Enter' || e.key === '+') {
        e.preventDefault();
        increment();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="page page--narrow">
      <PageHead title="Tasbih" sub="Tap anywhere on the circle to count." />

      <div className="dhikr-chips" role="radiogroup" aria-label="Choose a dhikr">
        {DHIKR.map((d) => (
          <button
            key={d.id}
            type="button"
            role="radio"
            aria-checked={d.id === dhikr.id}
            className="chip"
            onClick={() => store.set((s) => ({ ...s, selected: d.id }))}
          >
            {d.translit}
          </button>
        ))}
      </div>

      <div className="tasbih">
        <button
          type="button"
          className={`counter${target && count > 0 && inRound === 0 ? ' is-complete' : ''}`}
          onClick={increment}
          aria-label={`Count ${dhikr.translit}. Current count ${count}${target ? ` of ${target}` : ''}.`}
        >
          <svg className="counter__ring" viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="46" className="ring-track" />
            {target > 0 && progress > 0 && (
              <circle cx="50" cy="50" r="46" className="ring-progress" strokeDasharray={`${progress * 289} 289`} />
            )}
          </svg>
          <span className="counter__inner">
            <span className="arabic counter__ar" lang="ar">
              {dhikr.arabic}
            </span>
            <span className="counter__num" aria-hidden="true">
              {target ? (count > 0 && inRound === 0 ? target : inRound) : count}
            </span>
            <span className="counter__of" aria-hidden="true">
              {target ? `of ${target}` : 'no target'}
            </span>
          </span>
        </button>
        <p className="counter__meaning">
          <strong>{dhikr.translit}</strong> — {dhikr.meaning}
        </p>
        <p className="counter__total" aria-live="polite">
          Total {count}
          {rounds > 0 && ` · ${rounds} round${rounds === 1 ? '' : 's'} complete`}
        </p>
      </div>

      <div className="tasbih-controls card card-pad">
        <div className="field">
          <span className="label" id="target-label">
            Target
          </span>
          <div className="segmented" role="radiogroup" aria-labelledby="target-label">
            {TARGETS.map((t) => (
              <label key={t}>
                <input type="radio" name="target" checked={target === t} onChange={() => setTarget(t)} />
                {t === 0 ? 'None' : t}
              </label>
            ))}
          </div>
        </div>
        <div className="tasbih-row">
          <button type="button" className="btn" onClick={reset} disabled={count === 0}>
            <RotateCcw aria-hidden="true" /> Reset
          </button>
          {canVibrate && (
            <div className="switch-row switch-row--inline">
              <label htmlFor="haptics">
                <span className="label small inline-meta">
                  <Vibrate size={16} aria-hidden="true" /> Vibration
                </span>
              </label>
              <span className="switch">
                <input id="haptics" type="checkbox" checked={settings.haptics} onChange={(e) => update({ haptics: e.target.checked })} />
                <span />
              </span>
            </div>
          )}
        </div>
        <p className="tiny muted">Your count is saved on this device, so you can come back to it later. Keyboard: press Space to count.</p>
      </div>
    </div>
  );
}
