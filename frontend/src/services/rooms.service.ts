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

export interface RoomUpdateRequest {
  number: string;
  building: string;
  category: string;
  capacity: number;
  floor: number;
  description?: string;
  status: string;
}

export interface RoomCreateRequest {
  number: string;
  building: string;
  category: string;
  capacity: number;
  floor: number;
  description?: string;
  status?: string;
}

export interface RoomPatchRequest {
  number?: string;
  building?: string;
  category?: string;
  capacity?: number;
  floor?: number;
  description?: string;
  status?: string;
}

function getAuthToken(): string | null {
  const savedTokens = localStorage.getItem("auth_tokens");
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
    throw new Error("Token de autenticação não encontrado");
  }

  const baseUrl = import.meta.env.VITE_BFF_URL || "http://localhost:8080";
  const url = `${baseUrl}/api/v1${endpoint}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
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
      let errorMessage = "Erro no servidor. Tente novamente mais tarde.";
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === "string") {
          errorMessage = errorData;
        }
      } catch {
        // Se falhar o parse, mantém mensagem genérica ou usa o texto cru se for curto
        if (responseText && responseText.length < 100) errorMessage = responseText;
      }
      console.error("API Error:", {
        status: response.status,
        statusText: response.statusText,
        body: responseText,
      });
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
      // Check if the response is wrapped in a 'data' field by the BFF
      if (parsedResponse && parsedResponse.data !== undefined) {
        console.log("API Response (extracted data):", parsedResponse.data);
        return parsedResponse.data as T;
      }
      console.log("API Response (raw):", parsedResponse);
      return parsedResponse as T;
    } catch (parseError) {
      console.error("Erro ao parsear resposta JSON:", parseError, responseText);
      throw new Error("Resposta do servidor não é um JSON válido");
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Erro desconhecido ao fazer requisição");
  }
}

// Normalizar room para garantir compatibilidade com id/_id
function normalizeRoom(room: any): Room {
  if (!room) return room;
  
  // Normalizar ID: aceitar tanto _id quanto id
  const normalized: Room = {
    ...room,
    id: room.id || room._id || '',
  };
  
  return normalized;
}

export async function getRooms(params?: {
  page?: number;
  limit?: number;
  building?: string;
  category?: string;
  status?: string;
  number?: string;
}): Promise<RoomListResponse> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append("page", params.page.toString());
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.building) queryParams.append("building", params.building);
  if (params?.category) queryParams.append("category", params.category);
  if (params?.status) queryParams.append("status", params.status);
  if (params?.number) queryParams.append("number", params.number);

  const queryString = queryParams.toString();
  const response = await apiRequest<RoomListResponse>(`/rooms${queryString ? `?${queryString}` : ''}`);
  
  // Normalizar rooms na lista
  if (response && response.items) {
    response.items = response.items.map(normalizeRoom);
  }
  
  return response;
}

export async function getRoomById(id: string): Promise<Room> {
  const room = await apiRequest<Room>(`/rooms/${id}`);
  return normalizeRoom(room);
}

export async function createRoom(data: RoomCreateRequest): Promise<Room> {
  return apiRequest<Room>(`/rooms`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateRoom(
  id: string,
  data: RoomUpdateRequest
): Promise<Room> {
  return apiRequest<Room>(`/rooms/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function patchRoom(
  id: string,
  data: RoomPatchRequest
): Promise<Room> {
  return apiRequest<Room>(`/rooms/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteRoom(id: string): Promise<void> {
  return apiRequest<void>(`/rooms/${id}`, {
    method: "DELETE",
  });
}
