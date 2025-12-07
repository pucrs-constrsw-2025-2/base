const API_BASE_URL = 'http://localhost:8080/api/v1';

export interface Professor {
  _id?: string;
  id?: string;
  registration_number: string;
  name: string;
  email: string;
  department?: string;
  status: 'active' | 'inactive' | 'on_leave';
  hire_date?: string;
  phone_numbers?: string[];
  courses?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfessorCreateRequest {
  registration_number: string;
  name: string;
  email: string;
  department?: string;
  status: 'active' | 'inactive' | 'on_leave';
  hire_date?: string;
  phone_numbers?: string[];
  courses?: string[];
}

export interface ProfessorUpdateRequest {
  registration_number?: string;
  name?: string;
  email?: string;
  department?: string;
  status?: 'active' | 'inactive' | 'on_leave';
  hire_date?: string;
  phone_numbers?: string[];
  courses?: string[];
}

export interface ProfessorListResponse {
  professors: Professor[];
  total: number;
  page: number;
  size: number;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  name?: string;
  department?: string;
  status?: string;
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
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

export async function getProfessors(params?: PaginationParams): Promise<ProfessorListResponse> {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.size) queryParams.append('size', params.size.toString());
  if (params?.name) queryParams.append('name', params.name);
  if (params?.department) queryParams.append('department', params.department);
  if (params?.status) queryParams.append('status', params.status);
  
  const query = queryParams.toString();
  const endpoint = `/professors${query ? `?${query}` : ''}`;
  
  return apiRequest<ProfessorListResponse>(endpoint);
}

export async function createProfessor(data: ProfessorCreateRequest): Promise<Professor> {
  return apiRequest<Professor>('/professors', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateProfessor(id: string, data: ProfessorUpdateRequest): Promise<Professor> {
  return apiRequest<Professor>(`/professors/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteProfessor(id: string): Promise<void> {
  await apiRequest<void>(`/professors/${id}`, {
    method: 'DELETE',
  });
}
