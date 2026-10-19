import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import styles from './Ui.module.css';

const ToastContext = createContext(null);
// Shared provider hook belongs with its context.
// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }) {
  const [message, setMessage] = useState('');
  const timer = useRef();
  const announce = useCallback((text) => {
    clearTimeout(timer.current);
    setMessage(text);
    timer.current = setTimeout(() => setMessage(''), 5000);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);
  return (
    <ToastContext.Provider value={announce}>
      {children}
      <div role="status" aria-live="polite" className={message ? styles.toast : undefined}>
        {message}
      </div>
    </ToastContext.Provider>
  );
}
