export function getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiGet<T>(path: string): Promise<T> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
    };
    const res = await fetch(`/api${path}`, { headers });
    if (!res.ok) throw new Error(await res.text());
    return (await res.json()) as T;
}

export async function apiPost<T>(path: string, body: any): Promise<T> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
    };
    const res = await fetch(`/api${path}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await res.text());
    return (await res.json()) as T;
}
