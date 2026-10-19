import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { applicationRoutes } from '../app/routeConfig';
import { Providers } from '../app/Providers';

function openRoute(path) {
  const router = createMemoryRouter(applicationRoutes, { initialEntries: [path] });
  render(
    <Providers>
      <RouterProvider router={router} />
    </Providers>,
  );
  return router;
}

describe('login-first routing', () => {
  it('opens login from the root with no landing or preview links', async () => {
    const router = openRoute('/');
    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeVisible();
    expect(router.state.location.pathname).toBe('/login');
    expect(screen.queryByRole('link', { name: /explore/i })).not.toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Sign in', exact: true })).toBeEnabled(),
    );
    expect(screen.getByLabelText('Email address')).toBeEnabled();
  });

  it.each([
    '/app',
    '/app/dashboard',
    '/app/markets',
    '/app/terminal/demo',
    '/app/paper',
    '/app/orders',
    '/app/portfolio',
    '/app/journal',
    '/app/settings',
    '/app/unknown',
  ])('blocks unauthenticated access to %s', async (path) => {
    const router = openRoute(path);
    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeVisible();
    expect(router.state.location.pathname).toBe('/login');
    expect(new URLSearchParams(router.state.location.search).get('returnTo')).toMatch(
      /^\/app(?:\/|$)/,
    );
    expect(screen.queryByRole('navigation', { name: 'Workspace' })).not.toBeInTheDocument();
    expect(screen.queryByText('Awaiting account connection')).not.toBeInTheDocument();
  });

  it('never follows an external returnTo parameter', async () => {
    const router = openRoute('/login?returnTo=https://outside.example');
    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeVisible();
    expect(router.state.location.pathname).toBe('/login');
    expect(screen.queryByRole('link', { name: /outside/i })).not.toBeInTheDocument();
  });

  it('registration and missing pages only link back to login', async () => {
    openRoute('/register');
    expect(await screen.findByRole('link', { name: 'Sign in', exact: true })).toHaveAttribute(
      'href',
      '/login?returnTo=%2Fapp%2Fdashboard',
    );
    expect(screen.queryByRole('link', { name: /workspace/i })).not.toBeInTheDocument();
  });
});
