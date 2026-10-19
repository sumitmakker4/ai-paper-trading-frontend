import { Link } from 'react-router-dom';
import { useProfile } from '../features/auth/useAuth';
import { Skeleton } from '../components/ui/Controls';
import styles from './Workspace.module.css';

export function Component() {
  const { data: user, isPending, error } = useProfile();
  if (isPending) return <Skeleton label="Loading your account" />;
  if (error) return <p role="alert">Unable to load your account. Please try again.</p>;
  return (
    <>
      <div className={styles.pageHeader}>
        <div>
          <h1>Dashboard</h1>
          <p>Welcome, {user.name}.</p>
        </div>
      </div>
      <section className={styles.settings} aria-labelledby="account-heading">
        <h2 id="account-heading">Your account is ready</h2>
        <p>You’re signed in as {user.email}.</p>
        <p>
          Historical market data and paper trading are not available yet. Your account does not
          contain real-money funds.
        </p>
        <Link to="/app/settings">View your profile and preferences →</Link>
      </section>
    </>
  );
}
