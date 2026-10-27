import { API_URL, AUTH_URL } from '../config.js';

export class ApiError extends Error {
  constructor(status, body, message) {
    super(message || body?.error || `Request failed (${status})`);
    this.status = status;
    this.body = body;
  }
}

// Paths starting with /auth go to the auth service, everything else to the API gateway.
// credentials: 'include' sends the session cookie across origins (the services allow this origin via CORS).
export async function request(path, { method = 'GET', body, signal } = {}) {
  const base = path.startsWith('/auth') ? AUTH_URL : API_URL;
  let response;
  try {
    response = await fetch(`${base}${path}`, {
      method,
      signal,
      credentials: 'include',
      headers: body ? { 'content-type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError(0, null, 'Cannot reach the server. Check that the backend services are running.');
  }
  if (response.status === 204) return null;
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(response.status, data);
  return data;
}
