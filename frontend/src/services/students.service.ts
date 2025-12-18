const API_BASE_URL = 'http://localhost:8080/api/v1';

export interface Student {
  _id?: string;
  id?: string;
  registration_number: string;
  name: string;
  email: string;
  phone_numbers?: string[];
  course?: string;
  enrollment_status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentCreateRequest {
  registration_number: string;
  name: string;
  email: string;
  phone_numbers?: string[];
  course?: string;
  enrollment_status?: string;
}

export interface StudentUpdateRequest {
  registration_number?: string;
  name?: string;
  email?: string;
  phone_numbers?: string[];
  course?: string;
  enrollment_status?: string;
}

export interface StudentListResponse {
  students: Student[];
  total: number;
  page: number;
  size: number;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  name?: string;
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

export async function getStudents(params?: PaginationParams): Promise<StudentListResponse> {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.size) queryParams.append('size', params.size.toString());
  if (params?.name) queryParams.append('name', params.name);
  
  const query = queryParams.toString();
  const endpoint = `/students${query ? `?${query}` : ''}`;
  
  return apiRequest<StudentListResponse>(endpoint);
}

export async function createStudent(data: StudentCreateRequest): Promise<Student> {
  return apiRequest<Student>('/students', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateStudent(id: string, data: StudentUpdateRequest): Promise<Student> {
  return apiRequest<Student>(`/students/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteStudent(id: string): Promise<void> {
  await apiRequest<void>(`/students/${id}`, {
    method: 'DELETE',
  });
}

export async function deletePhoneNumber(studentId: string, phoneIndex: number): Promise<Student> {
  return apiRequest<Student>(`/students/${studentId}/phone/${phoneIndex}`, {
    method: 'DELETE',
  });
}
