import { useId } from 'react';
import styles from './Ui.module.css';

export function Button({ variant = 'primary', className = '', ...props }) {
  return <button className={`${styles.button} ${styles[variant]} ${className}`} {...props} />;
}

export function Input({ label, error, hint, id, ...props }) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const description = error || hint;
  return (
    <div className={styles.field}>
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={description ? `${inputId}-help` : undefined}
        {...props}
      />
      {description && (
        <span id={`${inputId}-help`} className={error ? styles.error : styles.hint}>
          {description}
        </span>
      )}
    </div>
  );
}

export function Skeleton({ label = 'Loading page' }) {
  return (
    <div role="status" aria-label={label} className={styles.skeleton}>
      <span>Loading…</span>
    </div>
  );
}
