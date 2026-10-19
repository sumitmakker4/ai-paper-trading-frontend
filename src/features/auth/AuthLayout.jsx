import { Button } from '../../components/ui/Controls';
import { useUi } from '../../stores/ui';
import styles from '../../pages/Login.module.css';

export function AuthLayout({ title, subtitle, children }) {
  const theme = useUi((state) => state.theme);
  const setTheme = useUi((state) => state.setTheme);
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span aria-hidden="true" className={styles.logo}>
            ↗
          </span>
          <span>
            TradeMind <b>AI</b>
          </span>
        </div>
        <Button
          variant="secondary"
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          {theme === 'dark' ? '☀' : '☾'}
        </Button>
      </header>
      <main className={styles.main}>
        <section className={styles.card} aria-labelledby="auth-title">
          <span className={styles.eyebrow}>YOUR TRADING WORKSPACE</span>
          <h1 id="auth-title">{title}</h1>
          <p className={styles.intro}>{subtitle}</p>
          {children}
        </section>
      </main>
      <footer className={styles.footer}>
        <span>PAPER TRADING · VIRTUAL MONEY</span>
        <p>Educational historical simulation. No real-money trading.</p>
      </footer>
    </div>
  );
}
