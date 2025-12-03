// Serviço para listar cursos a partir do BFF
// Sem adicionar novas dependências.
export interface Course {
  id: string;
  name?: string;
  credits?: number;
  modality?: string;
  description?: string;
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
  if (!token) {
    throw new Error('Token de autenticação não encontrado');
  }
  const baseUrl = (import.meta as any).env?.VITE_BFF_URL || 'http://localhost:8080';
  const url = `${baseUrl}/api/v1${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...(options.headers as HeadersInit),
  };

  const response = await fetch(url, { ...options, headers });
  const text = await response.text();
  if (!response.ok) {
    let message = 'Erro ao chamar serviço de cursos';
    try {
      const json = JSON.parse(text);
      message = json.detail || json.message || message;
    } catch {}
    throw new Error(message);
  }
  if (!text) return undefined as T;
  try {
    const data = JSON.parse(text);
    // BFF pode embrulhar em { data: [...] }
    if (data && data.data !== undefined) return data.data as T;
    return data as T;
  } catch {
    throw new Error('Resposta inválida do serviço de cursos');
  }
}

export async function listCourses(): Promise<Course[]> {
  return apiRequest<Course[]>('/courses');
}

export default { listCourses };
