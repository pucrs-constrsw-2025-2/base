export interface ListParams {
  page?: number;
  size?: number;
  year?: number;
  semester?: number;
  course_id?: string;
}

function getAuthToken(): string | null {
  const savedTokens = localStorage.getItem('auth_tokens');
  if (!savedTokens) return null;
  try {
    const tokens = JSON.parse(savedTokens);
    return tokens.access_token || null;
  } catch {
    return null;
  }
}

function getBaseUrl(): string {
  const env = (import.meta as any).env || {};
  const baseUrl = env.VITE_BFF_URL || 'http://localhost:8080';
  return `${baseUrl}/api/v1/classes`;
}

const BASE = getBaseUrl();

async function handleResp(res: Response) {
  if (!res.ok) {
    const txt = await res.text();
    let msg = txt;
    try {
      const json = JSON.parse(txt);
      msg = json.message || JSON.stringify(json);
    } catch (_) {
      // keep text
    }
    throw new Error(msg || `HTTP ${res.status}`);
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return res.json();
  return null;
}

function qs(params: Record<string, any> = {}) {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
  if (entries.length === 0) return '';
  return '?' + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join('&');
}

export async function listClasses(params: ListParams = {}) {
  const query = qs(params as any);
  const token = getAuthToken();
  const res = await fetch(`${BASE}${query}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return handleResp(res);
}

export async function getClass(id: string) {
  const token = getAuthToken();
  const res = await fetch(`${BASE}/${encodeURIComponent(id)}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return handleResp(res);
}

export async function createClass(payload: any) {
  const token = getAuthToken();
  const res = await fetch(BASE, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  return handleResp(res);
}

export async function updateClass(id: string, payload: any) {
  const token = getAuthToken();
  const res = await fetch(`${BASE}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  return handleResp(res);
}

export async function patchClass(id: string, payload: any) {
  const token = getAuthToken();
  const res = await fetch(`${BASE}/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  return handleResp(res);
}

export async function deleteClass(id: string) {
  const token = getAuthToken();
  const res = await fetch(`${BASE}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return handleResp(res);
}

export default {
  listClasses,
  getClass,
  createClass,
  updateClass,
  patchClass,
  deleteClass,
};
