import { useSyncExternalStore } from 'react';
import { useQuery } from '@tanstack/react-query';
import { auth, authenticatedRequest } from './session';
import { queryKeys } from '../../services/queryKeys';

export function useAuthStatus() {
  return useSyncExternalStore(auth.subscribe, auth.getSnapshot);
}

export function useProfile() {
  const { status, userId } = useAuthStatus();
  return useQuery({
    queryKey: queryKeys.user(userId),
    enabled: status === 'authenticated',
    queryFn: ({ signal }) => authenticatedRequest('/users/me', { signal }),
    retry: false,
  });
}
