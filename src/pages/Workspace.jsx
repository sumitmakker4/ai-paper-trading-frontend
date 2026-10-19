import { Link, useMatches } from 'react-router-dom';
import styles from './Workspace.module.css';

export function Component() {
  const matches = useMatches();
  const route = matches.at(-1).handle;
  const dashboard = route.path === 'dashboard';
  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.eyebrow}>YOUR LEARNING JOURNEY</div>
          <h1>{route.title}</h1>
          <p>{route.description}</p>
        </div>
        <span className={styles.phase}>FOUNDATION / 01</span>
      </div>
      {dashboard && (
        <section className={styles.welcome}>
          <div>
            <span className={styles.eyebrow}>A THOUGHTFUL START</span>
            <h2>
              Learn the market.
              <br />
              <span>Find your own perspective.</span>
            </h2>
            <p>
              A space to research, practice and reflect —<br />
              with historical demo data and virtual money.
            </p>
            <Link to="/app/markets" className={styles.textLink}>
              Explore the workspace <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <div className={styles.orbit} aria-hidden="true">
            <span>↗</span>
          </div>
        </section>
      )}
      {dashboard && (
        <section className={styles.metrics} aria-label="Account data unavailable">
          {['Available cash', 'Reserved cash', 'Holdings value', 'Total equity'].map((title) => (
            <article key={title}>
              <span>{title}</span>
              <strong>—</strong>
              <small>Awaiting account connection</small>
            </article>
          ))}
        </section>
      )}
      <section className={styles.empty}>
        <span className={styles.emptyIcon} aria-hidden="true">
          {route.symbol}
        </span>
        <div className={styles.eyebrow}>NOT CONNECTED</div>
        <h2>{route.empty}</h2>
        <p>{route.detail}</p>
        <span className={styles.emptyFoot}>No balances, quotes or activity to display</span>
      </section>
      {dashboard && (
        <div className={styles.learning}>
          <span aria-hidden="true">◇</span>
          <div>
            <strong>Good practice starts with understanding.</strong>
            <p>Historical outcomes help you learn. They do not guarantee future returns.</p>
          </div>
          <span className={styles.eyebrow}>PRACTICE WITH PERSPECTIVE</span>
        </div>
      )}
    </>
  );
}
