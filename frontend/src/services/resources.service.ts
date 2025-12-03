export interface Resource {
  id: string;
  name?: string;
  category?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ResourceListResponse {
  items: Resource[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
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

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  if (!token) throw new Error('Token de autenticação não encontrado');

  const baseUrl = (import.meta as any)?.env?.VITE_BFF_URL || 'http://localhost:8080';
  const url = `${baseUrl}/api/v1${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...(options.headers as HeadersInit),
  };

  const response = await fetch(url, { ...options, headers });
  const responseText = await response.text();

  if (!response.ok) {
    let errorMessage = 'Erro no servidor. Tente novamente mais tarde.';
    try {
      const errorData = JSON.parse(responseText);
      if (errorData.detail) errorMessage = errorData.detail;
      else if (errorData.message) errorMessage = errorData.message;
      else if (typeof errorData === 'string') errorMessage = errorData;
    } catch {}
    throw new Error(errorMessage);
  }

  if (response.status === 204) return undefined as T;
  if (!responseText) return undefined as T;

  try {
    const parsed = JSON.parse(responseText);
    if (parsed && parsed.data !== undefined) return parsed.data as T;
    return parsed as T;
  } catch (e) {
    console.error('Erro ao parsear JSON:', e, responseText);
    throw new Error('Resposta do servidor não é um JSON válido');
  }
}

export async function getResources(params?: { page?: number; limit?: number; category?: string; name?: string; }): Promise<ResourceListResponse> {
  const qs = new URLSearchParams();
  if (params?.page) qs.append('page', String(params.page));
  if (params?.limit) qs.append('limit', String(params.limit));
  if (params?.category) qs.append('category', params.category);
  if (params?.name) qs.append('name', params.name);
  return apiRequest<ResourceListResponse>(`/resources${qs.toString() ? `?${qs.toString()}` : ''}`);
}

export async function getResourceById(id: string): Promise<Resource> {
  return apiRequest<Resource>(`/resources/${id}`);
}
