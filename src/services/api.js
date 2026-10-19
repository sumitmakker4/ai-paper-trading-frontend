const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export class ApiError extends Error {
  constructor(status, body, requestId) {
    super(body?.error?.message || 'The request could not be completed.');
    this.name = 'ApiError';
    this.status = status;
    this.code = body?.error?.code || 'UNEXPECTED_RESPONSE';
    this.details = body?.error?.details || {};
    this.requestId = body?.request_id || requestId;
  }
}

/** No automatic mutation retries. Retain requestId when retrying an uncertain request. */
export async function apiRequest(
  path,
  {
    method = 'GET',
    body,
    signal,
    requestId = crypto.randomUUID(),
    accessToken,
    credentials = 'omit',
    csrfToken,
  } = {},
) {
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('://'))
    throw new Error('An API resource path is required.');
  let response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method,
      signal,
      credentials,
      headers: {
        Accept: 'application/json',
        'X-Request-ID': requestId,
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError(
      0,
      {
        error: { code: 'NETWORK_ERROR', message: 'Unable to reach the server. Please try again.' },
      },
      requestId,
    );
  }
  const responseId = response.headers.get('X-Request-ID') || requestId;
  if (response.status === 204) return undefined;
  let data;
  try {
    data = await response.json();
  } catch {
    throw new ApiError(response.status, null, responseId);
  }
  if (!response.ok) throw new ApiError(response.status, data, responseId);
  return data;
}
