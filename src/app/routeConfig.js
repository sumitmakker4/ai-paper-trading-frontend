import { redirect } from 'react-router-dom';
import { AuthGate } from '../features/auth/AuthGate';
import { appRoutes } from './routes';
import { Skeleton } from '../components/ui/Controls';

export const applicationRoutes = [
  { path: '/', loader: () => redirect('/login'), HydrateFallback: Skeleton },
  { path: '/login', lazy: () => import('../pages/SignIn'), HydrateFallback: Skeleton },
  { path: '/register', lazy: () => import('../pages/Register'), HydrateFallback: Skeleton },
  {
    path: '/app',
    Component: AuthGate,
    HydrateFallback: Skeleton,
    children: [
      { index: true, loader: () => redirect('/app/dashboard') },
      ...appRoutes.map((route) => ({
        path: route.path,
        handle: route,
        lazy: () =>
          route.path === 'settings'
            ? import('../pages/Settings')
            : route.path === 'dashboard'
              ? import('../pages/Dashboard')
              : import('../pages/Workspace'),
      })),
      {
        path: 'terminal/:instrumentId',
        handle: appRoutes[2],
        lazy: () => import('../pages/Workspace'),
      },
      { path: '*', lazy: () => import('../pages/NotFound') },
    ],
  },
  { path: '*', lazy: () => import('../pages/NotFound') },
];
