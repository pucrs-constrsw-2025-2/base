// Minimal auth service to call the gateway's Keycloak login endpoint
// Uses /api proxy configured in vite.config to avoid CORS in dev

export interface TokenResponse {
    access_token: string;
    expires_in: number;
    refresh_expires_in?: number;
    refresh_token?: string;
    token_type: string;
    session_state?: string;
    scope?: string;
}

function apiBase(): string {
    const base = (import.meta as any).env?.VITE_API_URL as string | undefined;
    return base?.trim() || '/api';
}

export async function login(username: string, password: string): Promise<TokenResponse> {
    const base = apiBase().replace(/\/$/, '');
    const url = `${base}/keycloak/login`;

    const body = new URLSearchParams();
    // Backed allows client_id in body; we default to env-configured client/secret on server
    body.append('grant_type', 'password');
    body.append('username', username);
    body.append('password', password);

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Login failed (${res.status}): ${text}`);
    }

    return (await res.json()) as TokenResponse;
}

export function parseJwt<T = any>(token: string): T | null {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map(function (c) {
                    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                })
                .join('')
        );
        return JSON.parse(jsonPayload) as T;
    } catch (e) {
        return null;
    }
}
