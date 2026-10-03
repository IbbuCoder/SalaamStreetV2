// End-to-end smoke tests in a real browser.
//
//   npm run build && npm run test:e2e
//
// Uses playwright-core with a locally installed Chromium. Set CHROMIUM_PATH if
// your browser lives elsewhere. Screenshots are written to ./screenshots.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { chromium } from 'playwright-core';

const PORT = 4179;
const BASE = `http://localhost:${PORT}`;
const SHOTS = 'screenshots';
const executablePath = process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium';

const VIEWPORTS = [
  { name: 'phone-small', width: 320, height: 640, mobile: true },
  { name: 'phone', width: 390, height: 844, mobile: true },
  { name: 'phone-large', width: 430, height: 932, mobile: true },
  { name: 'tablet', width: 768, height: 1024, mobile: true },
  { name: 'tablet-land', width: 1024, height: 768, mobile: false },
  { name: 'laptop', width: 1366, height: 768, mobile: false },
  { name: 'desktop', width: 1920, height: 1080, mobile: false },
];

const ROUTES = [
  '/',
  '/prayer',
  '/tracker',
  '/quran',
  '/quran/2?ayah=255',
  '/quran/juz/30',
  '/qibla',
  '/duas',
  '/duas/morning',
  '/tasbih',
  '/calendar',
  '/learn',
  '/learn/salah',
  '/settings',
  '/roadmap',
  '/more',
  '/about',
  '/does-not-exist',
];

// Mirrors displayArabic() in src/lib/quran.ts (open-tanween code points for display).
const OPEN = { '\u0657': '\u08F0', '\u065E': '\u08F1', '\u0656': '\u08F2' };
const AR = (surah) =>
  JSON.parse(fs.readFileSync(`public/data/quran/ar/${surah}.json`, 'utf8')).map((v) => v.replace(/[\u0656\u0657\u065E]/g, (c) => OPEN[c]));

const LONDON = { name: 'London', country: 'United Kingdom', lat: 51.5074, lng: -0.1278, tz: 'Europe/London', source: 'search' };

let failures = 0;
const ok = (msg) => console.log(`  ✓ ${msg}`);
const fail = (msg) => {
  failures++;
  console.log(`  ✗ ${msg}`);
};
const check = (cond, msg) => (cond ? ok(msg) : fail(msg));

async function waitForServer() {
  for (let i = 0; i < 50; i++) {
    try {
      const r = await fetch(BASE);
      if (r.ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error('Preview server did not start');
}

function watchErrors(page, bucket) {
  page.on('console', (m) => {
    if (m.type() === 'error' && !/geocoding-api\.open-meteo\.com|ERR_TUNNEL|ERR_CONNECTION|Failed to load resource/.test(m.text())) {
      bucket.push(m.text());
    }
  });
  page.on('pageerror', (e) => bucket.push(String(e)));
}

async function newContext(browser, vp, { location = LONDON, theme = 'light', geo, serviceWorkers = 'allow' } = {}) {
  const ctx = await browser.newContext({
    serviceWorkers,
    viewport: { width: vp.width, height: vp.height },
    isMobile: vp.mobile,
    hasTouch: vp.mobile,
    deviceScaleFactor: 1,
    timezoneId: 'Europe/London',
    locale: 'en-GB',
    colorScheme: theme,
    ...(geo ? { geolocation: geo, permissions: ['geolocation'] } : {}),
  });
  await ctx.addInitScript(
    ({ loc }) => {
      if (loc && !localStorage.getItem('ss.settings')) localStorage.setItem('ss.settings', JSON.stringify({ location: loc }));
    },
    { loc: location },
  );
  return ctx;
}

async function main() {
  fs.mkdirSync(SHOTS, { recursive: true });
  const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], { stdio: 'ignore' });
  try {
    await waitForServer();
    const browser = await chromium.launch({ executablePath });

    // ---------- Layout: every route at every viewport ----------
    console.log('\nLayout & console checks');
    for (const vp of VIEWPORTS) {
      const ctx = await newContext(browser, vp);
      const page = await ctx.newPage();
      const errors = [];
      watchErrors(page, errors);
      const overflow = [];
      for (const route of ROUTES) {
        await page.goto(BASE + route, { waitUntil: 'networkidle' });
        await page.waitForTimeout(150);
        const o = await page.evaluate(() => {
          const w = document.documentElement.clientWidth;
          const offenders = [...document.querySelectorAll('body *')]
            .filter((el) => {
              const r = el.getBoundingClientRect();
              if (r.width === 0) return false;
              // Ignore content inside intentional horizontal scrollers.
              for (let p = el.parentElement; p; p = p.parentElement) {
                const ox = getComputedStyle(p).overflowX;
                if (ox === 'auto' || ox === 'scroll' || ox === 'hidden') return false;
              }
              return r.right > w + 1 || r.left < -1;
            })
            .slice(0, 3)
            .map((el) => `${el.tagName.toLowerCase()}.${[...el.classList].join('.')}`);
          return { scroll: document.documentElement.scrollWidth > w + 1, offenders };
        });
        if (o.scroll || o.offenders.length) overflow.push(`${route} ${o.offenders.join(', ')}`);
        const safe = route.replace(/[^a-z0-9]+/gi, '_') || 'home';
        if (['phone-small', 'phone', 'tablet', 'desktop'].includes(vp.name)) {
          await page.screenshot({ path: `${SHOTS}/${vp.name}${safe}.png`, fullPage: false });
        }
      }
      check(overflow.length === 0, `${vp.name} (${vp.width}px): no horizontal overflow${overflow.length ? ' → ' + overflow.join(' | ') : ''}`);
      check(errors.length === 0, `${vp.name}: no console errors${errors.length ? ' → ' + errors.slice(0, 3).join(' | ') : ''}`);
      await ctx.close();
    }

    // ---------- Dark mode screenshots ----------
    {
      const ctx = await newContext(browser, VIEWPORTS[1], { theme: 'dark' });
      const page = await ctx.newPage();
      for (const r of ['/', '/quran/1', '/qibla', '/tasbih']) {
        await page.goto(BASE + r, { waitUntil: 'networkidle' });
        await page.screenshot({ path: `${SHOTS}/dark${r.replace(/[^a-z0-9]+/gi, '_')}.png` });
      }
      const theme = await page.evaluate(() => document.documentElement.dataset.theme);
      check(theme === 'dark', 'system dark mode is applied');
      await ctx.close();
    }

    // ---------- Flows ----------
    console.log('\nUser flows');
    const vp = VIEWPORTS[1];

    // First run: no location → welcome → pick a city from search.
    {
      const ctx = await newContext(browser, vp, { location: null });
      const page = await ctx.newPage();
      await page.goto(BASE + '/', { waitUntil: 'networkidle' });
      check(await page.getByRole('heading', { name: 'Welcome to SalaamStreet' }).isVisible(), 'first visit shows welcome + location setup');
      await page.screenshot({ path: `${SHOTS}/flow-welcome.png` });
      await page.getByPlaceholder('Search for a city').fill('Karachi');
      await page.getByRole('button', { name: /Karachi/ }).first().click();
      await page.waitForSelector('.next-card');
      const rows = await page.locator('.schedule__row').count();
      check(rows === 6, `schedule shows 6 rows after choosing a city (got ${rows})`);
      const method = await page.evaluate(() => JSON.parse(localStorage.getItem('ss.settings')).location.tz);
      check(method === 'Asia/Karachi', 'chosen city time zone is saved');
      await ctx.close();
    }

    // Device location granted.
    {
      const ctx = await newContext(browser, vp, { location: null, geo: { latitude: 21.42, longitude: 39.83 } });
      const page = await ctx.newPage();
      await page.goto(BASE + '/', { waitUntil: 'networkidle' });
      await page.getByRole('button', { name: 'Use my current location' }).click();
      await page.waitForSelector('.next-card');
      check((await page.locator('.loc-chip').innerText()).includes('Makkah'), 'device location resolves to nearest city (Makkah)');
      await ctx.close();
    }

    // Device location denied.
    {
      const ctx = await newContext(browser, vp, { location: null });
      const page = await ctx.newPage();
      // Headless Chromium leaves the permission prompt pending, so simulate the user denying it.
      await page.addInitScript(() => {
        navigator.geolocation.getCurrentPosition = (_ok, err) =>
          setTimeout(() => err({ code: 1, PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3, message: 'denied' }), 50);
      });
      await page.goto(BASE + '/', { waitUntil: 'networkidle' });
      await page.getByRole('button', { name: 'Use my current location' }).click();
      const alert = page.locator('.loc-setup .alert');
      await alert.waitFor();
      check(/denied|choose your city/i.test(await alert.innerText()), 'denied location shows a helpful message');
      await page.screenshot({ path: `${SHOTS}/flow-location-denied.png` });
      await ctx.close();
    }

    // Prayer tracker on Home + Tracker page.
    {
      const ctx = await newContext(browser, vp);
      const page = await ctx.newPage();
      await page.goto(BASE + '/', { waitUntil: 'networkidle' });
      const enabled = page.locator('.schedule .track-btn:not([disabled])');
      const n = await enabled.count();
      if (n > 0) {
        await enabled.first().click();
        check(/Completed/.test(await enabled.first().getAttribute('aria-label')), 'tapping a prayer marks it completed');
        await enabled.first().click();
        check(/Missed/.test(await enabled.first().getAttribute('aria-label')), 'tapping again marks it missed');
      } else {
        ok('no prayers have started yet today (tracker buttons correctly disabled)');
      }
      await page.goto(BASE + '/tracker', { waitUntil: 'networkidle' });
      check((await page.locator('.tracker-list li').count()) === 5, 'tracker lists 5 prayers');
      await page.locator('.hist-cell').first().click().catch(() => {});
      await ctx.close();
    }

    // Quran
    {
      const ctx = await newContext(browser, vp);
      const page = await ctx.newPage();
      const errors = [];
      watchErrors(page, errors);
      await page.goto(BASE + '/quran', { waitUntil: 'networkidle' });
      check((await page.locator('.surah-row').count()) === 114, 'surah list has 114 surahs');
      await page.getByRole('tab', { name: 'Juzʾ' }).click();
      check((await page.locator('.surah-row').count()) === 30, 'juz list has 30 parts');
      await page.getByPlaceholder(/Surah name/).fill('kahf');
      check(await page.getByText('Al-Kahf').first().isVisible(), 'search by surah name');
      await page.getByPlaceholder(/Surah name/).fill('2:255');
      await page.getByRole('link', { name: /Go to 2:255/ }).click();
      await page.waitForSelector('#v-2\\:255');
      await page.waitForTimeout(400);
      const inView = await page.evaluate(() => {
        const r = document.getElementById('v-2:255').getBoundingClientRect();
        return r.top >= -5 && r.top < window.innerHeight;
      });
      check(inView, 'reference search jumps to 2:255');
      const ar = await page.locator('#v-2\\:255 .verse__ar').innerText();
      check(ar.startsWith(AR(2)[254]), 'Ayat al-Kursi Arabic text renders verbatim');
      await page.getByRole('button', { name: 'Bookmark verse 2:255' }).click();
      await page.goto(BASE + '/quran?tab=bookmarks', { waitUntil: 'networkidle' });
      check((await page.locator('.bm-row').count()) === 1, 'bookmark saved and listed');
      await page.goto(BASE + '/quran', { waitUntil: 'networkidle' });
      check((await page.locator('.continue__k').innerText()) === 'Continue reading', 'continue reading appears after reading');
      await page.getByPlaceholder(/Surah name/).fill('mercy');
      await page.getByRole('button', { name: /Search the translation/ }).click();
      await page.waitForSelector('.hit', { timeout: 15000 });
      check((await page.locator('.hit').count()) > 10, 'full-text translation search returns results');
      await page.goto(BASE + '/quran/1', { waitUntil: 'networkidle' });
      await page.getByRole('button', { name: 'Reading' }).click();
      await page.locator('#reader-tr').selectOption('ur');
      await page.waitForSelector('.verse__tr[dir="rtl"]');
      check(true, 'switching translation to Urdu renders right-to-left');
      await page.locator('#reader-tr').selectOption('en');
      await page.goto(BASE + '/quran/115', { waitUntil: 'networkidle' });
      check(await page.getByText('Page not found').isVisible(), 'invalid surah shows not-found');
      await page.goto(BASE + '/quran/juz/30', { waitUntil: 'networkidle' });
      check((await page.locator('.surah-head').count()) === 37, 'juz 30 shows 37 surah headers');
      check(errors.length === 0, `no console errors in Quran flow${errors.length ? ' → ' + errors.join(' | ') : ''}`);
      await ctx.close();
    }

    // Quran offline / failed data → error state
    {
      const ctx = await newContext(browser, vp, { serviceWorkers: 'block' });
      const page = await ctx.newPage();
      await page.route('**/data/quran/**', (r) => r.abort());
      await page.goto(BASE + '/quran/3', { waitUntil: 'networkidle' });
      check(await page.getByText('This surah could not be loaded').isVisible(), 'Quran load failure shows a clear error state');
      await page.screenshot({ path: `${SHOTS}/flow-quran-error.png` });
      await ctx.close();
    }

    // Duas
    {
      const ctx = await newContext(browser, vp);
      const page = await ctx.newPage();
      await page.goto(BASE + '/duas/sleep', { waitUntil: 'networkidle' });
      const kursi = page.locator('.dua', { hasText: 'Ayat al-Kursi' }).locator('.dua__ar');
      check((await kursi.innerText()) === AR(2)[254], 'Quranic dua text comes verbatim from the dataset');
      check((await page.locator('.dua', { hasText: 'The three Quls' }).locator('.dua__ar').count()) === 3, 'three Quls show all three surahs');
      const counter = page.locator('.repeat__btn').first();
      if (await counter.count()) {
        await counter.click();
        check(/1\//.test(await counter.innerText()), 'repeat counter increments');
      }
      await ctx.close();
    }

    // Tasbih
    {
      const ctx = await newContext(browser, vp);
      const page = await ctx.newPage();
      await page.goto(BASE + '/tasbih', { waitUntil: 'networkidle' });
      for (let i = 0; i < 3; i++) await page.locator('.counter').click();
      check((await page.locator('.counter__num').innerText()) === '3', 'tasbih counts taps');
      await page.reload({ waitUntil: 'networkidle' });
      check((await page.locator('.counter__num').innerText()) === '3', 'tasbih count persists after reload');
      await page.getByRole('button', { name: 'Reset' }).click();
      check((await page.locator('.counter__num').innerText()) === '0', 'tasbih reset');
      await ctx.close();
    }

    // Qibla
    {
      const ctx = await newContext(browser, VIEWPORTS[5]);
      const page = await ctx.newPage();
      await page.goto(BASE + '/qibla', { waitUntil: 'networkidle' });
      const txt = await page.locator('.qibla-big').innerText();
      check(/^119°/.test(txt), `London Qibla bearing ≈ 119° (got ${txt})`);
      await page.getByRole('button', { name: 'Use device compass' }).click();
      await page.waitForTimeout(3300);
      check(await page.locator('.qibla-actions .alert').isVisible(), 'no compass sensor → helpful fallback message');
      await ctx.close();
    }

    // Settings: theme, method, adjustments, 24h
    {
      const ctx = await newContext(browser, vp);
      const page = await ctx.newPage();
      await page.goto(BASE + '/settings', { waitUntil: 'networkidle' });
      await page.getByRole('radio', { name: 'Dark' }).check({ force: true });
      check((await page.evaluate(() => document.documentElement.dataset.theme)) === 'dark', 'theme switch to dark');
      await page.getByRole('radio', { name: '24-hour' }).check({ force: true });
      await page.locator('#method').selectOption('NorthAmerica');
      await page.getByRole('button', { name: 'Increase Maghrib adjustment' }).click();
      await page.goto(BASE + '/prayer', { waitUntil: 'networkidle' });
      const times = await page.locator('.schedule__time').allInnerTexts();
      check(times.every((t) => /^\d{2}:\d{2}$/.test(t)), `24-hour format applied (${times.join(', ')})`);
      check((await page.locator('.calc-info').innerText()).includes('ISNA'), 'chosen calculation method shown');
      await page.goto(BASE + '/settings#notifications', { waitUntil: 'networkidle' });
      check(await page.locator('#n-fajr').isDisabled(), 'notification toggles are clearly not active yet');
      await ctx.close();
    }

    // Keyboard: skip link and focus
    {
      const ctx = await newContext(browser, VIEWPORTS[5]);
      const page = await ctx.newPage();
      await page.goto(BASE + '/', { waitUntil: 'networkidle' });
      await page.keyboard.press('Tab');
      check((await page.evaluate(() => document.activeElement?.textContent)) === 'Skip to content', 'first Tab focuses skip link');
      await ctx.close();
    }

    // Broken internal links
    {
      console.log('\nLinks');
      const ctx = await newContext(browser, VIEWPORTS[5]);
      const page = await ctx.newPage();
      const seen = new Set();
      const queue = ['/'];
      const broken = [];
      while (queue.length) {
        const path = queue.shift();
        if (seen.has(path)) continue;
        seen.add(path);
        await page.goto(BASE + path, { waitUntil: 'networkidle' });
        if (await page.getByText('Page not found').count()) broken.push(path);
        const hrefs = await page.$$eval('a[href^="/"]', (as) => as.map((a) => a.getAttribute('href')));
        for (const h of hrefs) {
          const clean = h.split('#')[0];
          if (!seen.has(clean) && !/^\/quran\/\d+/.test(clean) && seen.size < 120) queue.push(clean);
        }
      }
      check(broken.length === 0, `crawled ${seen.size} internal pages, no broken links${broken.length ? ' → ' + broken.join(', ') : ''}`);
      await ctx.close();
    }

    await browser.close();
  } finally {
    server.kill();
  }
  console.log(failures ? `\n${failures} check(s) failed` : '\nAll checks passed');
  process.exit(failures ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
