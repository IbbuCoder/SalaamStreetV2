import { Link } from 'react-router-dom';
import { LogoMark } from '../components/Logo';
import { PageHead } from '../components/PageHead';
import { APP_VERSION } from '../content/roadmap';
import { useHashScroll } from '../hooks/useHashScroll';
import { TRANSLATIONS } from '../lib/settings';
import '../styles/about.css';

export default function AboutPage() {
  useHashScroll();
  return (
    <div className="page page--narrow">
      <PageHead title="About SalaamStreet" docTitle="About" />

      <section className="about-hero card card-pad">
        <LogoMark className="about-mark" />
        <div>
          <p>
            SalaamStreet is a calm, everyday Islamic companion: accurate prayer times, the Quran, the Qibla, duas and the
            Hijri calendar — fast, private and free of clutter.
          </p>
          <p className="muted small">
            Version {APP_VERSION} · <Link to="/roadmap">What’s coming</Link>
          </p>
        </div>
      </section>

      <section id="privacy" className="about-section" aria-labelledby="privacy-title">
        <h2 id="privacy-title">Privacy</h2>
        <ul className="about-list">
          <li>
            <strong>No account, no tracking.</strong> SalaamStreet has no sign-up, no analytics, no advertising and no cookies.
          </li>
          <li>
            <strong>Your data stays on your device.</strong> Your location, prayer tracker, bookmarks, tasbih counts and
            preferences are stored only in this browser’s local storage. You can delete them at any time in{' '}
            <Link to="/settings#general">Settings</Link>.
          </li>
          <li>
            <strong>Location never leaves your device.</strong> Prayer times and the Qibla are calculated locally in your
            browser. When you use “current location”, your coordinates are not sent anywhere.
          </li>
          <li>
            <strong>City search.</strong> When you type in the city search, only the text you type is sent to the{' '}
            <a href="https://open-meteo.com/en/docs/geocoding-api" target="_blank" rel="noreferrer">
              Open-Meteo geocoding service
            </a>{' '}
            to find matching places. A built-in list of major cities works offline.
          </li>
          <li>
            <strong>Fonts and content are self-hosted.</strong> No requests are made to font or content providers while
            you browse.
          </li>
        </ul>
      </section>

      <section id="sources" className="about-section" aria-labelledby="sources-title">
        <h2 id="sources-title">Sources & accuracy</h2>
        <dl className="about-dl">
          <div>
            <dt>Quran text</dt>
            <dd>
              Uthmani script (King Fahd Glorious Quran Printing Complex), via{' '}
              <a href="https://quranenc.com" target="_blank" rel="noreferrer">
                The Noble Qurʾan Encyclopedia (QuranEnc)
              </a>
              . Displayed exactly as published — never edited or generated.
            </dd>
          </div>
          <div>
            <dt>Translations</dt>
            <dd>
              {TRANSLATIONS.map((t) => `${t.label.split(' · ').pop()} — ${t.author}`).join('; ')}. Sourced from{' '}
              <a href="https://tanzil.net/trans/" target="_blank" rel="noreferrer">
                Tanzil.net
              </a>{' '}
              and QuranEnc. Transliteration from Tanzil.net.
            </dd>
          </div>
          <div>
            <dt>Quran data package</dt>
            <dd>
              <a href="https://github.com/risan/quran-json" target="_blank" rel="noreferrer">
                quran-json
              </a>{' '}
              by Risan Bagja Pradana, licensed{' '}
              <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noreferrer">
                CC BY-SA 4.0
              </a>
              .
            </dd>
          </div>
          <div>
            <dt>Prayer times</dt>
            <dd>
              Calculated on your device with the open-source{' '}
              <a href="https://github.com/batoulapps/adhan-js" target="_blank" rel="noreferrer">
                Adhan
              </a>{' '}
              library (Batoul Apps, MIT licence), using the astronomical method you choose in Settings. Different methods
              give different Fajr and Isha times; follow your local masjid where possible.
            </dd>
          </div>
          <div>
            <dt>Hijri dates</dt>
            <dd>
              The Umm al-Qura calendar built into your browser. Local month starts may differ by a day due to moon sighting.
            </dd>
          </div>
          <div>
            <dt>Duas & learning</dt>
            <dd>
              Quranic passages are taken verbatim from the Quran text above. Supplications from the Sunnah are limited to
              well-known narrations and cite their collection and number (as numbered on{' '}
              <a href="https://sunnah.com" target="_blank" rel="noreferrer">
                sunnah.com
              </a>
              ). Learning guides note where scholars differ and are not a substitute for a qualified teacher.
            </dd>
          </div>
          <div>
            <dt>City search</dt>
            <dd>
              <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
                Open-Meteo
              </a>{' '}
              geocoding (CC BY 4.0), based on GeoNames data.
            </dd>
          </div>
          <div>
            <dt>Fonts & icons</dt>
            <dd>Amiri Quran, Figtree and Fraunces (SIL Open Font License); Lucide icons (ISC licence).</dd>
          </div>
        </dl>
        <p className="tiny muted">
          Found a mistake in any religious content? Please let us know so it can be checked and corrected.
        </p>
      </section>
    </div>
  );
}
