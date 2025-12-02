export interface PhoneNumber {
  ddd: number;
  number: number;
  description?: string;
}

export interface Student {
  _id: string;
  name: string;
  enrollment: string;
  email: string;
  course_curriculum: string;
  phoneNumbers?: PhoneNumber[];
  classes?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentListResponse {
  items?: Student[];
  data?: {
    items: Student[];
    meta?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface StudentCreateRequest {
  name: string;
  enrollment: string;
  email: string;
  course_curriculum: string;
  phoneNumbers?: PhoneNumber[];
  classes?: string[];
}

export interface StudentUpdateRequest {
  name?: string;
  enrollment?: string;
  email?: string;
  course_curriculum?: string;
  phoneNumbers?: PhoneNumber[];
  classes?: string[];
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

  const baseUrl = (import.meta.env.VITE_BFF_URL as string) || 'http://localhost:8080';
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
      let errorMessage = 'Erro no servidor. Tente novamente mais tarde.';
      try {
        const errorData = JSON.parse(responseText);
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } catch {
        // se não for JSON, manter mensagem padrão
      }
      console.error('API Error:', {
        status: response.status,
        statusText: response.statusText,
        body: responseText,
      });
      throw new Error(errorMessage);
    }

    if (response.status === 204) return undefined as unknown as T;

    if (!responseText) return undefined as unknown as T;

    try {
      const parsed = JSON.parse(responseText);
      // BFF pode encapsular em { data: ... }
      if (parsed && parsed.data !== undefined) return parsed.data as T;
      return parsed as T;
    } catch (parseError) {
      console.error('Erro ao parsear resposta JSON:', parseError, responseText);
      throw new Error('Resposta do servidor não é um JSON válido');
    }
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error('Erro desconhecido ao fazer requisição');
  }
}

export async function getStudents(params?: {
  page?: number;
  size?: number;
  name?: string;
  email?: string;
  enrollment?: string;
}): Promise<StudentListResponse> {
  const q = new URLSearchParams();
  if (params?.page) q.append('page', String(params.page));
  if (params?.size) q.append('size', String(params.size));
  if (params?.name) q.append('name', params.name);
  if (params?.email) q.append('email', params.email);
  if (params?.enrollment) q.append('enrollment', params.enrollment);

  const query = q.toString();
  return apiRequest<StudentListResponse>(`/students${query ? `?${query}` : ''}`);
}

export async function getStudentById(id: string): Promise<Student> {
  return apiRequest<Student>(`/students/${id}`);
}

export async function createStudent(data: StudentCreateRequest): Promise<Student> {
  return apiRequest<Student>('/students', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateStudent(id: string, data: StudentUpdateRequest): Promise<Student> {
  return apiRequest<Student>(`/students/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function patchStudent(id: string, data: Partial<StudentUpdateRequest>): Promise<Student> {
  return apiRequest<Student>(`/students/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteStudent(id: string): Promise<void> {
  return apiRequest<void>(`/students/${id}`, { method: 'DELETE' });
}

export async function addPhoneNumber(id: string, phone: PhoneNumber): Promise<Student> {
  return apiRequest<Student>(`/students/${id}/phone-numbers`, {
    method: 'POST',
    body: JSON.stringify(phone),
  });
}

export async function deletePhoneNumber(id: string, phoneId: string): Promise<Student> {
  return apiRequest<Student>(`/students/${id}/phone-numbers/${phoneId}`, { method: 'DELETE' });
}
