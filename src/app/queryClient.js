import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: (count, error) => error.status !== 401 && count < 1 },
    mutations: { retry: false },
  },
});
