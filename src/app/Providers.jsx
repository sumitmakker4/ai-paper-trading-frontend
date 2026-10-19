import { useEffect } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '../components/ui/Toast';
import { queryClient } from './queryClient';
import { auth } from '../features/auth/session';

export function Providers({ children }) {
  useEffect(() => {
    void auth.ensureSession();
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>
  );
}
