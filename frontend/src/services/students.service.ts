export interface StudentPhoneNumber {
  ddd: number;
  number: number;
  description?: string;
}

export interface Student {
  id: string;
  _id?: string;
  name: string;
  enrollment: string;
  email: string;
  courseCurriculum?: string;
  // manter compatibilidade com o backend (snake_case)
  course_curriculum?: string;
  phoneNumbers?: StudentPhoneNumber[];
  classes?: string[];
}

export interface StudentCreateRequest {
  name: string;
  enrollment: string;
  email: string;
  courseCurriculum?: string;
  phoneNumbers?: StudentPhoneNumber[];
  classes?: string[];
}

export interface StudentUpdateRequest {
  name?: string;
  enrollment?: string;
  email?: string;
  courseCurriculum?: string;
  phoneNumbers?: StudentPhoneNumber[];
  classes?: string[];
}

export interface StudentListResponseMeta {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export interface StudentListResponse {
  data: Student[];
  meta?: StudentListResponseMeta;
}

export interface GetStudentsParams {
  page?: number;
  size?: number;
  name?: string;
  enrollment?: string;
  email?: string;
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
        if (responseText && responseText.length < 100) {
          errorMessage = responseText;
        }
      }
      console.error("API Error (students):", {
        url,
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
      // Alguns endpoints do BFF podem embrulhar em { data, meta }
      return parsedResponse as T;
    } catch (parseError) {
      console.error(
        "Erro ao parsear resposta JSON (students):",
        parseError,
        responseText
      );
      throw new Error("Resposta do servidor não é um JSON válido");
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Erro desconhecido ao fazer requisição de estudantes");
  }
}

function normalizeStudent(raw: any): Student {
  if (!raw) return raw;

  const id = raw.id || raw._id || "";

  const courseCurriculum =
    raw.courseCurriculum ?? raw.course_curriculum ?? undefined;

  return {
    ...raw,
    id,
    courseCurriculum,
    course_curriculum: raw.course_curriculum,
  } as Student;
}

export async function getStudents(
  params: GetStudentsParams = {}
): Promise<StudentListResponse> {
  const queryParams = new URLSearchParams();

  if (params.name) queryParams.append("name", params.name);
  if (params.enrollment) queryParams.append("enrollment", params.enrollment);
  if (params.email) queryParams.append("email", params.email);

  const queryString = queryParams.toString();

  // O BFF hoje apenas faz proxy para o serviço de students, que retorna um array simples.
  const rawResponse = await apiRequest<any>(
    `/students${queryString ? `?${queryString}` : ""}`
  );

  let items: any[] = [];

  if (Array.isArray(rawResponse)) {
    items = rawResponse;
  } else if (rawResponse && Array.isArray(rawResponse.data)) {
    items = rawResponse.data;
  } else if (rawResponse && Array.isArray(rawResponse.items)) {
    items = rawResponse.items;
  } else if (rawResponse) {
    // Caso o backend mude para um formato diferente no futuro
    console.warn("Estrutura de resposta inesperada em getStudents:", rawResponse);
    if (Array.isArray((rawResponse as any).students)) {
      items = (rawResponse as any).students;
    }
  }

  const normalized = items.map(normalizeStudent);

  const total = normalized.length;
  const page = params.page && params.page > 0 ? params.page : 1;
  const size = params.size && params.size > 0 ? params.size : total || 1;

  const start = (page - 1) * size;
  const end = start + size;
  const data = normalized.slice(start, end);

  const totalPages = size > 0 ? Math.max(1, Math.ceil(total / size)) : 1;

  return {
    data,
    meta: {
      page,
      size,
      total,
      totalPages,
    },
  };
}

export async function createStudent(
  data: StudentCreateRequest
): Promise<Student> {
  const payload: any = {
    name: data.name,
    enrollment: data.enrollment,
    email: data.email,
    course_curriculum: data.courseCurriculum ?? data.course_curriculum,
    phoneNumbers: data.phoneNumbers ?? [],
    classes: data.classes,
  };

  const response = await apiRequest<any>("/students", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const raw = (response?.data || response) as any;
  return normalizeStudent(raw);
}

export async function updateStudent(
  id: string,
  data: StudentUpdateRequest
): Promise<void> {
  const payload: any = {};

  if (data.name !== undefined) payload.name = data.name;
  if (data.enrollment !== undefined) payload.enrollment = data.enrollment;
  if (data.email !== undefined) payload.email = data.email;
  if (data.courseCurriculum !== undefined || data.course_curriculum !== undefined) {
    payload.course_curriculum =
      data.courseCurriculum ?? data.course_curriculum;
  }
  if (data.phoneNumbers !== undefined) payload.phoneNumbers = data.phoneNumbers;
  if (data.classes !== undefined) payload.classes = data.classes;

  await apiRequest<void>(`/students/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteStudent(id: string): Promise<void> {
  await apiRequest<void>(`/students/${id}`, {
    method: "DELETE",
  });
}

export async function deletePhoneNumber(
  studentId: string,
  phoneNumberId: string
): Promise<void> {
  await apiRequest<void>(`/students/${studentId}/phone-numbers/${phoneNumberId}`, {
    method: "DELETE",
  });
}


