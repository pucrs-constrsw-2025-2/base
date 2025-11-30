export type RoomStatus = 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';

// Interface atualizada para corresponder ao room.entity.ts do backend
export interface Room {
  _id: string; // Alterado de 'id' para '_id'
  number: string;
  building: string;
  category: string;
  capacity: number;
  floor: number;
  description?: string;
  status: RoomStatus;
  createdAt?: string;
  updatedAt?: string;
  // Mobílias são opcionais pois o backend pode não retorná-las ainda
  furnitures?: Furniture[]; 
}

// Representação básica de Mobília baseada no schema
export interface Furniture {
  id: string;
  name: string;
  type: string;
  status: string;
}

export interface CreateRoomDto {
  number: string;
  building: string;
  category: string;
  capacity: number;
  floor: number;
  description?: string;
  status?: RoomStatus;
}

export interface RoomListResponse {
  items: Room[];
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

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Token de autenticação não encontrado');
  }

  const baseUrl = import.meta.env.VITE_BFF_URL || 'http://localhost:8080';
  const url = `${baseUrl}/api/v1${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...(options.headers as HeadersInit),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const responseText = await response.text();

    if (!response.ok) {
      let errorMessage = 'Erro no servidor.';
      try {
        const errorData = JSON.parse(responseText);
        // Tenta extrair mensagem de erro de vários formatos comuns
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch {
        // Se falhar o parse, mantém mensagem genérica ou usa o texto cru se for curto
        if (responseText && responseText.length < 100) errorMessage = responseText;
      }
      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    if (!responseText) {
      return undefined as T;
    }

    try {
      const parsedResponse = JSON.parse(responseText);
      // Alguns endpoints do BFF podem encapsular em 'data', outros retornam direto
      if (parsedResponse && parsedResponse.data !== undefined && !Array.isArray(parsedResponse)) {
          // Nota: Verificamos !Array.isArray porque listas as vezes vem direto
          return parsedResponse.data as T;
      }
      return parsedResponse as T;
    } catch {
      throw new Error('Resposta do servidor não é um JSON válido');
    }
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error('Erro desconhecido na requisição');
  }
}

// --- Métodos Públicos ---

export async function getRooms(params?: {
  page?: number;
  limit?: number;
  building?: string;
  category?: string;
  status?: string;
  number?: string;
}): Promise<RoomListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.building) queryParams.append('building', params.building);
  if (params?.category) queryParams.append('category', params.category);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.number) queryParams.append('number', params.number);

  const queryString = queryParams.toString();
  return apiRequest<RoomListResponse>(`/rooms${queryString ? `?${queryString}` : ''}`);
}

export async function getRoomById(id: string): Promise<Room> {
  return apiRequest<Room>(`/rooms/${id}`);
}

export async function createRoom(data: CreateRoomDto): Promise<Room> {
  return apiRequest<Room>('/rooms', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateRoom(id: string, data: Partial<CreateRoomDto>): Promise<Room> {
  return apiRequest<Room>(`/rooms/${id}`, {
    method: 'PUT', // BFF define PUT para update completo
    body: JSON.stringify(data),
  });
}

export async function deleteRoom(id: string): Promise<void> {
  return apiRequest<void>(`/rooms/${id}`, {
    method: 'DELETE',
  });
}