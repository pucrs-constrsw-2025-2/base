const API_BASE_URL = 'http://localhost:8080/api/v1';

export interface AuthorizedUser {
  id?: string;
  user_id: string;
  name: string;
}

export interface Reservation {
  // backend may return `reservation_id` (UUID) or `id` or `_id`
  reservation_id?: string;
  id?: string;
  _id?: string;
  initial_date: string;
  end_date: string;
  details?: string;
  authorizedUsers?: AuthorizedUser[];
  resource_id?: string;
  lesson_id?: string;
}

export interface CreateReservationRequest {
  initial_date: string;
  end_date: string;
  details?: string;
  authorizedUsers?: AuthorizedUser[];
  resource_id?: string;
  lesson_id?: string;
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

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const responseText = await response.text();

  if (!response.ok) {
    let errorMessage = 'Erro ao processar requisição';
    if (responseText) {
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch {
        if (responseText.length < 200) errorMessage = responseText;
      }
    }
    if (response.status === 401) errorMessage = 'Não autorizado. Faça login novamente.';
    else if (response.status === 404) errorMessage = 'Recurso não encontrado';
    else if (response.status === 400) errorMessage = errorMessage || 'Dados inválidos.';
    else if (response.status >= 500) errorMessage = errorMessage || 'Erro no servidor. Tente novamente mais tarde.';
    throw new Error(errorMessage);
  }

  if (response.status === 204) return undefined as T;
  if (!responseText) return undefined as T;

  try {
    return JSON.parse(responseText) as T;
  } catch (e) {
    console.error('Erro ao parsear JSON:', e, responseText);
    throw new Error('Resposta do servidor não é um JSON válido');
  }
}

export async function getReservations(query?: { reservation_id?: string } ): Promise<Reservation[]> {
  const params = new URLSearchParams();
  if (query?.reservation_id) params.append('reservation_id', query.reservation_id);
  const qs = params.toString();
  const endpoint = `/reservations${qs ? `?${qs}` : ''}`;

  const response = await apiRequest<any>(endpoint);
  // BFF may wrap in { data: [...] } or return array directly
  let items: any[] = [];
  if (response && response.data) items = response.data;
  else if (Array.isArray(response)) items = response;
  else if (response && Array.isArray((response as any).reservations)) items = (response as any).reservations;

  // Normalize each reservation to ensure `id` is present (friendly for UI)
  return items.map((r) => ({
    ...r,
    id: r.reservation_id || r.id || r._id,
  })) as Reservation[];
}

export async function getReservationById(id: string): Promise<Reservation> {
  const response = await apiRequest<any>(`/reservations/${id}`);
  const raw = (response?.data || response) as any;
  return { ...raw, id: raw.reservation_id || raw.id || raw._id } as Reservation;
}

export async function createReservation(data: CreateReservationRequest): Promise<Reservation> {
  // Backend expects snake_case as in openapi (dates as strings), send as-is
  const response = await apiRequest<any>('/reservations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  const raw = (response?.data || response) as any;
  return { ...raw, id: raw.reservation_id || raw.id || raw._id } as Reservation;
}

export async function updateReservation(id: string, data: Partial<CreateReservationRequest>): Promise<Reservation> {
  const response = await apiRequest<any>(`/reservations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  const raw = (response?.data || response) as any;
  return { ...raw, id: raw.reservation_id || raw.id || raw._id } as Reservation;
}

export async function deleteReservation(id: string): Promise<void> {
  return apiRequest<void>(`/reservations/${id}`, { method: 'DELETE' });
}
