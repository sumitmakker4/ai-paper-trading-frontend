import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input } from '../components/ui/Controls';
import { AuthLayout } from '../features/auth/AuthLayout';
import { auth } from '../features/auth/session';
import { useAuthStatus } from '../features/auth/useAuth';
import { safeReturnTo } from '../features/auth/returnTo';
import { applyFieldErrors, registerSchema } from '../features/auth/validation';
import styles from './Login.module.css';

export function Component() {
  const { status } = useAuthStatus();
  const navigate = useNavigate();
  const [parameters] = useSearchParams();
  const returnTo = safeReturnTo(parameters.get('returnTo'));
  const [error, setErrorMessage] = useState('');
  const alert = useRef(null);
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema), defaultValues: { acknowledge: false } });
  useEffect(() => {
    if (error) alert.current?.focus();
  }, [error]);
  if (status === 'authenticated') return <Navigate to={returnTo} replace />;
  async function onSubmit({ name, email, password }) {
    setErrorMessage('');
    try {
      await auth.register({ name, email, password });
    } catch (failure) {
      applyFieldErrors(failure, setError);
      setErrorMessage(failure.message);
      return;
    }
    try {
      await auth.login({ email, password });
    } catch {
      navigate(`/login?${new URLSearchParams({ returnTo })}`, {
        replace: true,
        state: { notice: 'Your account was created. Please sign in to continue.' },
      });
    }
  }
  return (
    <AuthLayout title="Create your account" subtitle="Start with your own secure workspace.">
      <form noValidate onSubmit={handleSubmit(onSubmit)}>
        {error && (
          <p ref={alert} tabIndex={-1} role="alert" className={styles.formError}>
            {error}
          </p>
        )}
        <fieldset disabled={isSubmitting || status === 'checking'} className={styles.fields}>
          <legend className={styles.srOnly}>Create an account</legend>
          <Input
            label="Full name"
            autoComplete="name"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Email address"
            type="email"
            autoComplete="username"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            hint="Use 12–128 characters."
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
          <label className={styles.acknowledge}>
            <input
              type="checkbox"
              aria-describedby={errors.acknowledge ? 'acknowledge-error' : undefined}
              {...register('acknowledge')}
            />
            <span>I understand this is educational paper trading using virtual money.</span>
          </label>
          {errors.acknowledge && (
            <span id="acknowledge-error" className={styles.formError}>
              {errors.acknowledge.message}
            </span>
          )}
          <Button type="submit">{isSubmitting ? 'Creating account…' : 'Create account'}</Button>
        </fieldset>
      </form>
      <p className={styles.notice}>
        Already registered? <Link to={`/login?${new URLSearchParams({ returnTo })}`}>Sign in</Link>
      </p>
    </AuthLayout>
  );
}
