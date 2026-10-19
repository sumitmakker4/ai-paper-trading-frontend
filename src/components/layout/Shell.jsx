import { Suspense, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { appRoutes } from '../../app/routes';
import { useUi } from '../../stores/ui';
import { Button, Skeleton } from '../ui/Controls';
import { useProfile } from '../../features/auth/useAuth';
import { auth } from '../../features/auth/session';
import styles from './Shell.module.css';

export function Shell() {
  const { data: user } = useProfile();
  const [logoutError, setLogoutError] = useState('');
  const [loggingOut, setLoggingOut] = useState(false);
  async function signOut() {
    setLoggingOut(true);
    setLogoutError('');
    try {
      await auth.logout();
    } catch {
      setLogoutError('Sign-out could not be completed. Please try again.');
    } finally {
      setLoggingOut(false);
    }
  }
  const [navOpen, setNavOpen] = useState(false);
  const theme = useUi((state) => state.theme);
  const setTheme = useUi((state) => state.setTheme);
  const location = useLocation();
  const main = useRef(null);
  const previousPath = useRef(location.pathname);
  useEffect(() => {
    if (previousPath.current !== location.pathname) main.current?.focus();
    previousPath.current = location.pathname;
  }, [location.pathname]);
  return (
    <div className={styles.shell}>
      <a href="#main" className={styles.skip}>
        Skip to content
      </a>
      <aside className={styles.sidebar}>
        <Link to="/app/dashboard" className={styles.brand}>
          <span className={styles.logo} aria-hidden="true">
            ↗
          </span>
          <span>
            TradeMind <b>AI</b>
          </span>
        </Link>
        <div className={styles.workspaceLabel}>PRACTICE WORKSPACE</div>
        <Button
          variant="secondary"
          className={styles.menuToggle}
          aria-expanded={navOpen}
          aria-controls="workspace-nav"
          onClick={() => setNavOpen(!navOpen)}
        >
          Navigation {navOpen ? '−' : '+'}
        </Button>
        <nav
          id="workspace-nav"
          aria-label="Workspace"
          className={`${styles.nav} ${navOpen ? styles.navOpen : ''}`}
        >
          {appRoutes.map((route) => (
            <NavLink
              key={route.path}
              to={`/app/${route.path}`}
              className={({ isActive }) => (isActive ? styles.active : undefined)}
              onClick={() => setNavOpen(false)}
            >
              <span aria-hidden="true">{route.symbol}</span>
              {route.title}
            </NavLink>
          ))}
        </nav>
        <div className={styles.sidebarNote}>
          <span className={styles.noteIcon} aria-hidden="true">
            ◇
          </span>
          <strong>Room to learn.</strong>
          <p>
            Practice decisions.
            <br />
            Build understanding.
          </p>
          <span className={styles.smallBadge}>EDUCATIONAL USE</span>
        </div>
      </aside>
      <div className={styles.workspace}>
        <header className={styles.header}>
          <div className={styles.environment}>
            <span aria-hidden="true" className={styles.dot} /> PAPER TRADING · VIRTUAL MONEY
          </div>
          <div className={styles.headerActions}>
            <span className={styles.history}>HISTORICAL REPLAY</span>
            <Button
              variant="secondary"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? '☀' : '☾'}
            </Button>
            <span className={styles.avatar} aria-label={user?.name || 'Your account'}>
              {user?.name?.slice(0, 1).toUpperCase()}
            </span>
            <Button
              variant="secondary"
              className={styles.signOut}
              disabled={loggingOut}
              onClick={signOut}
            >
              {loggingOut ? 'Signing out…' : 'Sign out'}
            </Button>
          </div>
        </header>
        {logoutError && (
          <p role="alert" className={styles.previewBanner}>
            {logoutError}
          </p>
        )}
        <main id="main" ref={main} tabIndex={-1} className={styles.main}>
          <Suspense fallback={<Skeleton />}>
            <Outlet />
          </Suspense>
        </main>
        <footer className={styles.footer}>
          <span>Demo data · No dataset connected · As of: unavailable</span>
          <span>Asia/Kolkata · INR · Simulated trades only</span>
        </footer>
      </div>
    </div>
  );
}
