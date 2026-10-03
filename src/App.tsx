import { lazy, useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ToastProvider } from './components/Toast';
import { SettingsProvider } from './lib/SettingsContext';
import TodayPage from './pages/Today';

// Today is bundled with the shell for a fast first load; everything else is split.
const PrayerPage = lazy(() => import('./pages/Prayer'));
const TrackerPage = lazy(() => import('./pages/Tracker'));
const QuranPage = lazy(() => import('./pages/Quran'));
const QuranReaderPage = lazy(() => import('./pages/QuranReader'));
const QiblaPage = lazy(() => import('./pages/Qibla'));
const DuasPage = lazy(() => import('./pages/Duas'));
const DuaCategoryPage = lazy(() => import('./pages/DuaCategory'));
const TasbihPage = lazy(() => import('./pages/Tasbih'));
const CalendarPage = lazy(() => import('./pages/Calendar'));
const LearnPage = lazy(() => import('./pages/Learn'));
const LearnTopicPage = lazy(() => import('./pages/LearnTopic'));
const SettingsPage = lazy(() => import('./pages/Settings'));
const RoadmapPage = lazy(() => import('./pages/Roadmap'));
const MorePage = lazy(() => import('./pages/More'));
const AboutPage = lazy(() => import('./pages/About'));
const NotFoundPage = lazy(() => import('./pages/NotFound'));

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
  return null;
}

export function App() {
  return (
    <SettingsProvider>
      <ToastProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<TodayPage />} />
              <Route path="prayer" element={<PrayerPage />} />
              <Route path="tracker" element={<TrackerPage />} />
              <Route path="quran" element={<QuranPage />} />
              <Route path="quran/juz/:juz" element={<QuranReaderPage />} />
              <Route path="quran/:surah" element={<QuranReaderPage />} />
              <Route path="qibla" element={<QiblaPage />} />
              <Route path="duas" element={<DuasPage />} />
              <Route path="duas/:category" element={<DuaCategoryPage />} />
              <Route path="tasbih" element={<TasbihPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="learn" element={<LearnPage />} />
              <Route path="learn/:topic" element={<LearnTopicPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="roadmap" element={<RoadmapPage />} />
              <Route path="more" element={<MorePage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </SettingsProvider>
  );
}
