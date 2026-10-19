import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { http, HttpResponse, delay } from 'msw';
import { setupServer } from 'msw/node';
import { auth, authenticatedRequest } from '../features/auth/session';
import { safeReturnTo } from '../features/auth/returnTo';
import { queryClient } from '../app/queryClient';
import { Providers } from '../app/Providers';
import { applicationRoutes } from '../app/routeConfig';

const base = 'http://localhost:8000/api/v1';
const profile = {
  id: 'user-a',
  name: 'Alice',
  email: 'alice@example.com',
  created_at: '2026-10-19T00:00:00Z',
};
const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
beforeEach(async () => {
  await auth.expire();
  document.cookie = 'trademind_csrf=; Max-Age=0; Path=/';
  localStorage.clear();
  sessionStorage.clear();
  server.use(
    http.get(`${base}/users/me`, () => HttpResponse.json(profile)),
    http.post(`${base}/auth/login`, () =>
      HttpResponse.json({ access_token: 'access-a', user: profile, expires_in: 900 }),
    ),
  );
});
afterEach(async () => {
  await auth.expire();
  server.resetHandlers();
  document.cookie = 'trademind_csrf=; Max-Age=0; Path=/';
});
afterAll(() => server.close());

function open(path) {
  const router = createMemoryRouter(applicationRoutes, { initialEntries: [path] });
  render(
    <Providers>
      <RouterProvider router={router} />
    </Providers>,
  );
  return router;
}

describe('authentication session', () => {
  it('verifies profile before access and keeps tokens out of browser storage', async () => {
    await auth.login({ email: profile.email, password: 'long password' });
    expect(auth.getSnapshot()).toEqual({ status: 'authenticated', userId: profile.id });
    expect(queryClient.getQueryData(['user', profile.id])).toEqual(profile);
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
    expect(auth.getSnapshot()).not.toHaveProperty('access_token');
  });
  it('refreshes once for concurrent 401 reads and preserves request IDs', async () => {
    await auth.login({ email: profile.email, password: 'long password' });
    document.cookie = 'trademind_csrf=csrf-value; Path=/';
    let refreshes = 0;
    const ids = [];
    server.use(
      http.post(`${base}/auth/refresh`, async ({ request }) => {
        refreshes += 1;
        expect(request.headers.get('X-CSRF-Token')).toBe('csrf-value');
        await delay(30);
        return HttpResponse.json({ access_token: 'access-b', user: profile });
      }),
      http.get(`${base}/private`, ({ request }) => {
        ids.push(request.headers.get('X-Request-ID'));
        return request.headers.get('Authorization') === 'Bearer access-b'
          ? HttpResponse.json({ ok: true })
          : HttpResponse.json({ error: { code: 'AUTH_EXPIRED' } }, { status: 401 });
      }),
    );
    await Promise.all([
      authenticatedRequest('/private', { requestId: 'intent-one' }),
      authenticatedRequest('/private', { requestId: 'intent-two' }),
    ]);
    expect(refreshes).toBe(1);
    expect(ids.filter((id) => id === 'intent-one')).toHaveLength(2);
    expect(ids.filter((id) => id === 'intent-two')).toHaveLength(2);
  });
  it('never retries a mutation and clears private caches after 401', async () => {
    await auth.login({ email: profile.email, password: 'long password' });
    queryClient.setQueryData(['private-positions'], { secret: true });
    let mutations = 0;
    server.use(
      http.post(`${base}/private`, () => {
        mutations += 1;
        return HttpResponse.json({ error: { code: 'AUTH_EXPIRED' } }, { status: 401 });
      }),
    );
    await expect(
      authenticatedRequest('/private', { method: 'POST', body: {} }),
    ).rejects.toMatchObject({ status: 401 });
    expect(mutations).toBe(1);
    expect(queryClient.getQueryData(['private-positions'])).toBeUndefined();
    expect(auth.getSnapshot().status).toBe('anonymous');
  });
  it('returns to signed-out state after refresh rejection', async () => {
    document.cookie = 'trademind_csrf=csrf-value; Path=/';
    server.use(
      http.post(`${base}/auth/refresh`, () =>
        HttpResponse.json({ error: { code: 'AUTH_INVALID_SESSION' } }, { status: 401 }),
      ),
    );
    await auth.retryRecovery();
    expect(auth.getSnapshot().status).toBe('anonymous');
  });
  it('shows recoverable network failure without granting access', async () => {
    document.cookie = 'trademind_csrf=csrf-value; Path=/';
    server.use(http.post(`${base}/auth/refresh`, () => HttpResponse.error()));
    await auth.retryRecovery();
    expect(auth.getSnapshot().status).toBe('unavailable');
  });
  it('clears caches after logout and when switching users', async () => {
    await auth.login({ email: profile.email, password: 'long password' });
    queryClient.setQueryData(['private-data'], { owner: 'Alice' });
    server.use(http.post(`${base}/auth/logout`, () => new HttpResponse(null, { status: 204 })));
    await auth.logout();
    expect(queryClient.getQueryData(['private-data'])).toBeUndefined();
    expect(auth.getSnapshot().status).toBe('anonymous');
    server.use(
      http.get(`${base}/users/me`, () =>
        HttpResponse.json({ ...profile, id: 'user-b', name: 'Bob' }),
      ),
    );
    await auth.login({ email: 'bob@example.com', password: 'long password' });
    expect(queryClient.getQueryData(['user', 'user-a'])).toBeUndefined();
    expect(auth.getSnapshot().userId).toBe('user-b');
  });
  it('does not claim logout succeeded after a network failure', async () => {
    await auth.login({ email: profile.email, password: 'long password' });
    server.use(http.post(`${base}/auth/logout`, () => HttpResponse.error()));
    await expect(auth.logout()).rejects.toMatchObject({ status: 0 });
    expect(auth.getSnapshot().status).toBe('authenticated');
  });
});

describe('auth forms and protected routes', () => {
  it('preserves inputs and focuses the error after failed login', async () => {
    server.use(
      http.post(`${base}/auth/login`, () =>
        HttpResponse.json(
          {
            error: { code: 'AUTH_INVALID_CREDENTIALS', message: 'Email or password is incorrect.' },
          },
          { status: 401 },
        ),
      ),
    );
    const user = userEvent.setup();
    open('/login');
    await user.type(await screen.findByLabelText('Email address'), profile.email);
    await user.type(screen.getByLabelText('Password'), 'long password');
    await user.click(screen.getByRole('button', { name: 'Sign in', exact: true }));
    expect(await screen.findByRole('alert')).toHaveFocus();
    expect(screen.getByLabelText('Email address')).toHaveValue(profile.email);
    expect(screen.getByLabelText('Password')).toHaveValue('long password');
  });
  it('opens actual profile settings after login', async () => {
    const user = userEvent.setup();
    const router = open('/login?returnTo=%2Fapp%2Fsettings');
    await user.type(await screen.findByLabelText('Email address'), profile.email);
    await user.type(screen.getByLabelText('Password'), 'long password');
    await user.click(screen.getByRole('button', { name: 'Sign in', exact: true }));
    expect(await screen.findByRole('heading', { name: 'Your profile' })).toBeVisible();
    expect(router.state.location.pathname).toBe('/app/settings');
    expect(screen.getByText(profile.email)).toBeVisible();
    expect(screen.queryByText('Awaiting account connection')).not.toBeInTheDocument();
  });
  it('validates password confirmation and acknowledgement before registration', async () => {
    const user = userEvent.setup();
    open('/register');
    await user.type(await screen.findByLabelText('Full name'), 'Alice');
    await user.type(screen.getByLabelText('Email address'), profile.email);
    await user.type(screen.getByLabelText('Password', { exact: true }), 'long password');
    await user.type(screen.getByLabelText('Confirm password'), 'different password');
    await user.click(screen.getByRole('button', { name: 'Create account', exact: true }));
    expect(await screen.findByText('Passwords must match.')).toBeVisible();
    expect(screen.getByText('Please acknowledge educational paper trading.')).toBeVisible();
  });
  it.each([
    'https://evil.example',
    '//evil.example',
    '/app/../login',
    '/app\\evil',
    '/app/%2f%2fevil',
    'javascript:alert(1)',
  ])('rejects unsafe return path %s', (path) => {
    expect(safeReturnTo(path)).toBe('/app/dashboard');
  });
});
