import { getAccessToken } from './auth';

export function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const token = getAccessToken();
  const headers = new Headers(init.headers || {});
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(input, { ...init, headers });
}