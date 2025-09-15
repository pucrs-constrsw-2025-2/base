export interface TokenResponse {
  token_type: string;
  access_token: string;
  expires_in: number;
  refresh_token: string;
  refresh_expires_in: number;
}

const BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '';

export async function loginRequest(username: string, password: string): Promise<TokenResponse> {
  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // Gin ShouldBind aceita tanto JSON quanto form
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    let detail = '';
    try {
      const d = await res.json();
      detail = d?.message || d?.error || '';
    } catch {}
    throw new Error(`Falha no login (${res.status}) ${detail}`.trim());
  }
  return res.json();
}

const STORAGE_KEY = 'auth.tokens';

export function loadTokens(): TokenResponse | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveTokens(t: TokenResponse) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(t));
}

export function clearTokens() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getAccessToken(): string | null {
  return loadTokens()?.access_token || null;
}