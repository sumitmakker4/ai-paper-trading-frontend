import { apiRequest, ApiError } from '../../services/api';
import { queryClient } from '../../app/queryClient';
import { queryKeys } from '../../services/queryKeys';

let accessToken = null;
let snapshot = { status: 'checking', userId: null };
let refreshPromise = null;
let generation = 0;
const listeners = new Set();

function publish(status, userId = null) {
  snapshot = { status, userId };
  listeners.forEach((listener) => listener());
}

export function readCsrfCookie() {
  const entry = document.cookie.split('; ').find((item) => item.startsWith('trademind_csrf='));
  try {
    return entry ? decodeURIComponent(entry.slice('trademind_csrf='.length)) : '';
  } catch {
    return '';
  }
}

function serializeCookieChange(work) {
  // Coordinate rotating cookies across tabs without storing any tokens.
  return navigator.locks?.request
    ? navigator.locks.request('trademind-auth-cookies', work)
    : work();
}

async function clearPrivateData() {
  accessToken = null;
  await queryClient.cancelQueries();
  queryClient.clear();
}

async function acceptSession(result, expectedGeneration) {
  const profile = await apiRequest('/users/me', { accessToken: result.access_token });
  if (generation !== expectedGeneration) return;
  if (snapshot.userId !== profile.id) {
    await queryClient.cancelQueries();
    if (generation !== expectedGeneration) return;
    queryClient.clear();
  }
  if (generation !== expectedGeneration) return;
  accessToken = result.access_token;
  queryClient.setQueryData(queryKeys.user(profile.id), profile);
  publish('authenticated', profile.id);
}

function refreshSession() {
  if (refreshPromise) return refreshPromise;
  const expectedGeneration = generation;
  const task = serializeCookieChange(async () => {
    if (generation !== expectedGeneration) return;
    try {
      const csrfToken = readCsrfCookie();
      if (!csrfToken) {
        await clearPrivateData();
        if (generation === expectedGeneration) publish('anonymous');
        return;
      }
      const result = await apiRequest('/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        csrfToken,
      });
      await acceptSession(result, expectedGeneration);
    } catch (error) {
      if (generation !== expectedGeneration) return;
      await clearPrivateData();
      publish(error.status === 401 || error.status === 403 ? 'anonymous' : 'unavailable');
    }
  });
  refreshPromise = task.finally(() => {
    if (refreshPromise === wrapped) refreshPromise = null;
  });
  const wrapped = refreshPromise;
  return refreshPromise;
}

export const auth = {
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot() {
    return snapshot;
  },
  async ensureSession() {
    if (snapshot.status === 'checking') await refreshSession();
    return snapshot;
  },
  async retryRecovery() {
    publish('checking');
    await refreshSession();
  },
  async login(body) {
    generation += 1;
    const expectedGeneration = generation;
    await serializeCookieChange(async () => {
      const result = await apiRequest('/auth/login', {
        method: 'POST',
        body,
        credentials: 'include',
      });
      await acceptSession(result, expectedGeneration);
    });
  },
  async register(body) {
    return apiRequest('/auth/register', { method: 'POST', body });
  },
  async logout() {
    generation += 1;
    await serializeCookieChange(async () => {
      await apiRequest('/auth/logout', {
        method: 'POST',
        credentials: 'include',
        csrfToken: readCsrfCookie(),
        accessToken,
      });
      await clearPrivateData();
      publish('anonymous');
    });
  },
  async expire() {
    generation += 1;
    await clearPrivateData();
    publish('anonymous');
  },
};

export async function authenticatedRequest(path, options = {}) {
  await auth.ensureSession();
  if (!accessToken)
    throw new ApiError(401, { error: { code: 'AUTH_EXPIRED', message: 'Please sign in again.' } });
  const requestId = options.requestId || crypto.randomUUID();
  const originalToken = accessToken;
  try {
    return await apiRequest(path, { ...options, requestId, accessToken: originalToken });
  } catch (error) {
    if (error.status !== 401) throw error;
    const method = options.method || 'GET';
    if (method !== 'GET') {
      await auth.expire();
      throw error;
    }
    if (accessToken === originalToken) await refreshSession();
    if (!accessToken) throw error;
    try {
      return await apiRequest(path, { ...options, requestId, accessToken });
    } catch (retryError) {
      if (retryError.status === 401) await auth.expire();
      throw retryError;
    }
  }
}
