import { TRANSLATIONS, type TranslationLang } from '../lib/settings';
import { useSettings } from '../lib/SettingsContext';

/** Quran reading preferences; used in the reader panel and on the Settings page. */
export function ReadingSettings({ idPrefix = 'rs' }: { idPrefix?: string }) {
  const { settings, update } = useSettings();
  const q = settings.quran;
  const set = (patch: Partial<typeof q>) => update((s) => ({ quran: { ...s.quran, ...patch } }));
  return (
    <div className="reading-settings">
      <div className="field">
        <label htmlFor={`${idPrefix}-tr`}>Translation</label>
        <select
          id={`${idPrefix}-tr`}
          className="select"
          value={q.translation}
          onChange={(e) => set({ translation: e.target.value as TranslationLang })}
        >
          {TRANSLATIONS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label} — {t.author}
            </option>
          ))}
          <option value="none">Arabic only (no translation)</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor={`${idPrefix}-ar`}>
          Arabic size <span className="muted">· {q.arabicSize}px</span>
        </label>
        <input
          id={`${idPrefix}-ar`}
          type="range"
          className="range"
          min={22}
          max={48}
          step={2}
          value={q.arabicSize}
          onChange={(e) => set({ arabicSize: Number(e.target.value) })}
        />
        <p className="arabic size-preview" lang="ar" style={{ fontSize: q.arabicSize }} aria-hidden="true">
          السَّلَامُ عَلَيْكُمْ
        </p>
      </div>
      <div className="field">
        <label htmlFor={`${idPrefix}-tsz`}>
          Translation size <span className="muted">· {q.translationSize}px</span>
        </label>
        <input
          id={`${idPrefix}-tsz`}
          type="range"
          className="range"
          min={14}
          max={24}
          step={1}
          value={q.translationSize}
          onChange={(e) => set({ translationSize: Number(e.target.value) })}
        />
      </div>
      <div className="switch-row">
        <label htmlFor={`${idPrefix}-tl`}>
          <span className="label">Transliteration</span>
          <span className="hint">Show Latin-letter pronunciation under each verse</span>
        </label>
        <span className="switch">
          <input
            id={`${idPrefix}-tl`}
            type="checkbox"
            checked={q.transliteration}
            onChange={(e) => set({ transliteration: e.target.checked })}
          />
          <span />
        </span>
      </div>
    </div>
  );
}
