import { Link } from 'react-router-dom';
import styles from './Workspace.module.css';

export function Component() {
  return (
    <main className={styles.public}>
      <div className={styles.eyebrow}>404 · TRADEMIND AI</div>
      <h1>Page not found.</h1>
      <p>This address is not part of the workspace.</p>
      <Link to="/login">Back to sign in →</Link>
    </main>
  );
}
