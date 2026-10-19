import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { apiRequest, ApiError } from '../services/api';
import { queryKeys } from '../services/queryKeys';

const base = 'http://localhost:8000/api/v1';
const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('API boundary', () => {
  it('keeps decimal strings and sends a stable request ID', async () => {
    server.use(
      http.get(`${base}/example`, ({ request }) => {
        expect(request.headers.get('X-Request-ID')).toBe('test-request');
        return HttpResponse.json({ price: '100.050000' });
      }),
    );
    expect(await apiRequest('/example', { requestId: 'test-request' })).toEqual({
      price: '100.050000',
    });
  });
  it('normalizes canonical errors without retrying mutations', async () => {
    let count = 0;
    server.use(
      http.post(`${base}/example`, () => {
        count += 1;
        return HttpResponse.json(
          {
            error: { code: 'IDEMPOTENCY_CONFLICT', message: 'Refresh the resource.', details: {} },
            request_id: 'server-request',
          },
          { status: 409 },
        );
      }),
    );
    await expect(apiRequest('/example', { method: 'POST', body: {} })).rejects.toMatchObject({
      status: 409,
      code: 'IDEMPOTENCY_CONFLICT',
      requestId: 'server-request',
    });
    expect(count).toBe(1);
  });
  it('exposes network errors and no-content responses', async () => {
    server.use(
      http.get(`${base}/offline`, () => HttpResponse.error()),
      http.delete(`${base}/example`, () => new HttpResponse(null, { status: 204 })),
    );
    await expect(apiRequest('/offline')).rejects.toBeInstanceOf(ApiError);
    await expect(apiRequest('/example', { method: 'DELETE' })).resolves.toBeUndefined();
  });
  it('separates users, replay cutoffs and cursors in query keys', () => {
    const scope = {
      userId: 'u1',
      sessionId: 's1',
      instrumentId: 'i1',
      asOf: 't1',
      resource: 'candles',
    };
    expect(queryKeys.market(scope)).not.toEqual(queryKeys.market({ ...scope, userId: 'u2' }));
    expect(queryKeys.market(scope)).not.toEqual(queryKeys.market({ ...scope, asOf: 't2' }));
    expect(queryKeys.market(scope)).not.toEqual(queryKeys.market({ ...scope, cursor: 'page2' }));
  });
});
