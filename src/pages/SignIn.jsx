import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input } from '../components/ui/Controls';
import { AuthLayout } from '../features/auth/AuthLayout';
import { auth } from '../features/auth/session';
import { useAuthStatus } from '../features/auth/useAuth';
import { safeReturnTo } from '../features/auth/returnTo';
import { applyFieldErrors, loginSchema } from '../features/auth/validation';
import styles from './Login.module.css';

export function Component() {
  const { status } = useAuthStatus();
  const [parameters] = useSearchParams();
  const location = useLocation();
  const returnTo = safeReturnTo(parameters.get('returnTo'));
  const [error, setErrorMessage] = useState('');
  const alert = useRef(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(loginSchema) });
  useEffect(() => {
    if (error) alert.current?.focus();
  }, [error]);
  if (status === 'authenticated') return <Navigate to={returnTo} replace />;
  async function onSubmit(data) {
    setErrorMessage('');
    try {
      await auth.login(data);
    } catch (failure) {
      applyFieldErrors(failure, setError);
      setErrorMessage(failure.message);
    }
  }
  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your TradeMind account.">
      {location.state?.notice && (
        <p role="status" className={styles.notice}>
          {location.state.notice}
        </p>
      )}
      {status === 'unavailable' && (
        <div role="alert" className={styles.notice}>
          We couldn’t restore your session.{' '}
          <Button variant="secondary" onClick={() => auth.retryRecovery()}>
            Try again
          </Button>
        </div>
      )}
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        {error && (
          <p ref={alert} tabIndex={-1} role="alert" className={styles.formError}>
            {error}
          </p>
        )}
        <fieldset disabled={isSubmitting || status === 'checking'} className={styles.fields}>
          <legend className={styles.srOnly}>Sign in</legend>
          <Input
            label="Email address"
            type="email"
            autoComplete="username"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            error={errors.password?.message}
            {...register('password')}
          />
          <Button type="submit">
            {isSubmitting
              ? 'Signing in…'
              : status === 'checking'
                ? 'Restoring session…'
                : 'Sign in'}
          </Button>
        </fieldset>
      </form>
      <p className={styles.notice}>
        New to TradeMind?{' '}
        <Link to={`/register?${new URLSearchParams({ returnTo })}`}>Create an account</Link>
      </p>
      <div className={styles.private}>
        <span aria-hidden="true">◇</span> Your workspace is accessible only after sign-in.
      </div>
    </AuthLayout>
  );
}
