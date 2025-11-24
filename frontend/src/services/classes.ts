export interface ListParams {
  page?: number;
  size?: number;
  year?: number;
  semester?: number;
  course_id?: string;
}

// Build BASE from Vite environment variable `VITE_API_URL` (preferred).
// Support multiple formats in env:
// - http://host:port                  => becomes http://host:port/api/v1/classes
// - http://host:port/api              => becomes http://host:port/api/v1/classes
// - http://host:port/api/v1           => becomes http://host:port/api/v1/classes
// If VITE_API_URL is missing, fall back to a relative path so proxying works in dev.
function buildBase(): string {
  // Simple rule per request: host always 'bff', port is provided via Vite env
  const env = (import.meta as any).env || {};
  const port = env.BFF_INTERNAL_API_PORT || env.VITE_API_PORT || '3000';
  return `http://bff:${String(port)}/api/v1/classes`;
}

const BASE = buildBase();

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
  const res = await fetch(`${BASE}${query}`, { credentials: 'include' });
  return handleResp(res);
}

export async function getClass(id: string) {
  const res = await fetch(`${BASE}/${encodeURIComponent(id)}`, { credentials: 'include' });
  return handleResp(res);
}

export async function createClass(payload: any) {
  const res = await fetch(BASE, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResp(res);
}

export async function updateClass(id: string, payload: any) {
  const res = await fetch(`${BASE}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResp(res);
}

export async function patchClass(id: string, payload: any) {
  const res = await fetch(`${BASE}/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResp(res);
}

export async function deleteClass(id: string) {
  const res = await fetch(`${BASE}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    credentials: 'include',
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
