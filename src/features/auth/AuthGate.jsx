import { Navigate, useLocation } from 'react-router-dom';
import { Shell } from '../../components/layout/Shell';
import { Skeleton, Button } from '../../components/ui/Controls';
import { auth } from './session';
import { useAuthStatus } from './useAuth';

export function AuthGate() {
  const { status } = useAuthStatus();
  const location = useLocation();
  if (status === 'checking') return <Skeleton label="Restoring your session" />;
  if (status === 'unavailable')
    return (
      <main>
        <h1>Unable to restore your session</h1>
        <p>Check your connection and try again.</p>
        <Button onClick={() => auth.retryRecovery()}>Try again</Button>
      </main>
    );
  if (status !== 'authenticated') {
    const parameters = new URLSearchParams({ returnTo: `${location.pathname}${location.search}` });
    return <Navigate to={`/login?${parameters}`} replace />;
  }
  return <Shell />;
}
