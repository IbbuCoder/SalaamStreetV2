import { Suspense, useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { LogoMark } from './Logo';
import { NAV_BOTTOM, NAV_META, NAV_TOOLS } from './nav';
import { PageLoading } from './States';

const MORE_PATHS = ['/more', '/tracker', '/duas', '/tasbih', '/calendar', '/learn', '/settings', '/roadmap', '/about'];

export function Layout() {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Tools that live under "More" on phones keep that tab highlighted.
  const inMore = MORE_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));

  return (
    <div className="shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <nav className="sidebar" aria-label="Main">
        <Link to="/" className="brand" aria-label="SalaamStreet home">
          <LogoMark />
          <span className="brand-text">SalaamStreet</span>
        </Link>
        <span className="side-label">Daily</span>
        {NAV_TOOLS.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'} className="side-link">
            <item.icon aria-hidden="true" />
            <span>{item.short ? <SideText full={item.label} short={item.short} /> : item.label}</span>
          </NavLink>
        ))}
        <div className="side-sep" />
        <div className="side-foot">
          <span className="side-label">SalaamStreet</span>
          {NAV_META.map((item) => (
            <NavLink key={item.to} to={item.to} className="side-link">
              <item.icon aria-hidden="true" />
              <span>{item.short ? <SideText full={item.label} short={item.short} /> : item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="main-col">
        <header className={`topbar${scrolled ? ' is-scrolled' : ''}`}>
          <Link to="/" className="brand" aria-label="SalaamStreet home">
            <LogoMark />
            <span>SalaamStreet</span>
          </Link>
          <Link to="/settings" className="icon-btn" aria-label="Settings">
            <Settings size={22} aria-hidden="true" />
          </Link>
        </header>

        <main id="main" className="main" tabIndex={-1}>
          <Suspense fallback={<PageLoading />}>
            <Outlet />
          </Suspense>
        </main>
      </div>

      <nav className="bottom-nav" aria-label="Primary">
        {NAV_BOTTOM.map((item) => {
          const active = item.to === '/more' ? inMore : item.to === '/' ? pathname === '/' : pathname.startsWith(item.to);
          return (
            <Link key={item.to} to={item.to} aria-current={active ? 'page' : undefined}>
              <item.icon aria-hidden="true" />
              <span>{item.short ?? item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

/** Full label on wide sidebar, short label on the compact tablet rail. */
function SideText({ full, short }: { full: string; short: string }) {
  return (
    <>
      <span className="side-full">{full}</span>
      <span className="side-short" aria-hidden="true">
        {short}
      </span>
    </>
  );
}
