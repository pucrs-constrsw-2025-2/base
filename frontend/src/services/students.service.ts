export interface PhoneNumber {
  ddd: number;
  number: number;
  description?: string;
}

export interface Student {
  id: string;
  name: string;
  enrollment: string;
  email: string;
  courseCurriculum: string;
  phoneNumbers?: PhoneNumber[];
  classes?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentListResponse {
  data: Student[];
  meta?: {
    timestamp?: string;
    requestId?: string;
    version?: string;
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
  courseCurriculum: string;
  phoneNumbers?: PhoneNumber[];
  classes?: string[];
}

export interface StudentUpdateRequest {
  name?: string;
  enrollment?: string;
  email?: string;
  courseCurriculum?: string;
  phoneNumbers?: PhoneNumber[];
  classes?: string[];
}

function getAuthToken(): string | null {
  const savedTokens = localStorage.getItem('auth_tokens');
  if (!savedTokens) {
    console.error('❌ Token não encontrado no localStorage. Chave: "auth_tokens"');
    console.log('📋 Chaves disponíveis no localStorage:', Object.keys(localStorage));
    return null;
  }

  try {
    const tokens = JSON.parse(savedTokens);
    const token = tokens.access_token || null;
    if (!token) {
      console.error('❌ access_token não encontrado no objeto de tokens');
      console.log('📋 Estrutura dos tokens:', Object.keys(tokens));
    } else {
      console.log('✅ Token encontrado e recuperado com sucesso');
    }
    return token;
  } catch (error) {
    console.error('❌ Erro ao parsear tokens:', error);
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

  const baseUrl = (import.meta.env.VITE_API_URL as string) || 'http://localhost:8080';
  const url = `${baseUrl}/api/v1${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...(options.headers as HeadersInit),
  };

  console.log('📤 Enviando requisição para:', url);
  console.log('🔐 Headers sendo enviados:', {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token ? token.substring(0, 10) + '...' : 'NÃO ENCONTRADO'}`,
  });

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
  // Transformar os dados para o padrão esperado pela API (PascalCase)
  const apiData = {
    Name: data.name,
    Enrollment: data.enrollment,
    Email: data.email,
    CourseCurriculum: data.courseCurriculum,
    Classes: data.classes || [],
    PhoneNumbers: data.phoneNumbers || [],
  };
  
  return apiRequest<Student>('/students', {
    method: 'POST',
    body: JSON.stringify(apiData),
  });
}

export async function updateStudent(id: string, data: StudentUpdateRequest): Promise<Student> {
  // Transformar os dados para o padrão esperado pela API (PascalCase)
  const apiData: Record<string, any> = {};
  
  if (data.name !== undefined) apiData.Name = data.name;
  if (data.enrollment !== undefined) apiData.Enrollment = data.enrollment;
  if (data.email !== undefined) apiData.Email = data.email;
  if (data.courseCurriculum !== undefined) apiData.CourseCurriculum = data.courseCurriculum;
  if (data.classes !== undefined) apiData.Classes = data.classes;
  apiData.PhoneNumbers = data.phoneNumbers || [];
  
  return apiRequest<Student>(`/students/${id}`, {
    method: 'PUT',
    body: JSON.stringify(apiData),
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
