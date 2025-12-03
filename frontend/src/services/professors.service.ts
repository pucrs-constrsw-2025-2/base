/**
 * Professors Service
 *
 * Este service é responsável pela comunicação com o BFF para operações
 * relacionadas a professores.
 *
 * Endpoints do BFF:
 * - GET    /api/v1/professors      - Lista todos os professores
 * - POST   /api/v1/professors      - Cria um novo professor
 * - GET    /api/v1/professors/:id  - Busca professor por ID
 * - PUT    /api/v1/professors/:id  - Atualiza professor
 * - DELETE /api/v1/professors/:id  - Remove professor
 */

// URL base do BFF
const API_BASE_URL = "http://localhost:8080/api/v1";

// ============================================================================
// INTERFACES - Modelos de dados
// ============================================================================

/**
 * Interface do Professor (resposta da API)
 *
 * Campos obrigatórios vindos da API:
 * - id: UUID único do professor
 * - name: Nome completo
 * - registration_number: Número de matrícula (único)
 * - institucional_email: Email institucional (único)
 * - status: Estado atual (active, inactive, on_leave)
 */
export interface Professor {
  id: string;
  name: string;
  registration_number: number;
  institucional_email: string;
  status: "active" | "inactive" | "on_leave";
}

/**
 * Interface para criar um novo professor
 *
 * Todos os campos são obrigatórios na criação
 */
export interface ProfessorCreateRequest {
  name: string;
  registration_number: number;
  institucional_email: string;
  status: "active" | "inactive" | "on_leave";
}

/**
 * Interface para atualizar um professor
 *
 * Todos os campos são opcionais na atualização (PATCH-like)
 */
export interface ProfessorUpdateRequest {
  name?: string;
  registration_number?: number;
  institucional_email?: string;
  status?: "active" | "inactive" | "on_leave";
}

/**
 * Resposta paginada da API de professores
 */
export interface ProfessorsResponse {
  data: Professor[];
  total?: number;
  page?: number;
  limit?: number;
}

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Obtém o token de autenticação do localStorage
 *
 * O token é armazenado pelo auth.service.ts após o login
 * Formato: { access_token: string, refresh_token: string, ... }
 */
function getAuthToken(): string | null {
  const tokens = localStorage.getItem("auth_tokens");
  if (!tokens) {
    return null;
  }
  try {
    const parsed = JSON.parse(tokens);
    return parsed.access_token;
  } catch {
    return null;
  }
}

/**
 * Função genérica para fazer requisições autenticadas à API
 *
 * @param endpoint - Caminho do endpoint (ex: '/professors')
 * @param options - Opções do fetch (method, body, etc)
 * @returns Promise com o resultado tipado
 * @throws Error se a requisição falhar
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();

  // Verifica se o usuário está autenticado
  if (!token) {
    throw new Error("Usuário não autenticado. Faça login novamente.");
  }

  // Configura os headers padrão
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  // Faz a requisição
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Verifica se a resposta foi bem-sucedida
  if (!response.ok) {
    // Tenta extrair mensagem de erro do corpo da resposta
    let errorMessage = `Erro ${response.status}: ${response.statusText}`;
    try {
      const errorBody = await response.json();
      if (errorBody.message) {
        errorMessage = errorBody.message;
      } else if (errorBody.error) {
        errorMessage = errorBody.error;
      } else if (errorBody.detail) {
        errorMessage = errorBody.detail;
      }
    } catch {
      // Ignora erro ao parsear JSON
    }
    throw new Error(errorMessage);
  }

  // Retorna o corpo da resposta parseado
  // Para DELETE (204 No Content), retorna objeto vazio
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// ============================================================================
// FUNÇÕES DE CRUD
// ============================================================================

/**
 * Lista todos os professores
 *
 * @param page - Número da página (opcional)
 * @param limit - Quantidade por página (opcional)
 * @param search - Termo de busca (opcional)
 * @returns Lista de professores
 *
 * @example
 * const professors = await getProfessors();
 * const filtered = await getProfessors(1, 10, 'João');
 */
export async function getProfessors(
  page?: number,
  limit?: number,
  search?: string
): Promise<Professor[]> {
  // Monta os query parameters
  const params = new URLSearchParams();
  if (page !== undefined) params.append("page", page.toString());
  if (limit !== undefined) params.append("limit", limit.toString());
  if (search) params.append("name", search);

  const queryString = params.toString();
  const endpoint = `/professors${queryString ? `?${queryString}` : ""}`;

  // A API pode retornar array direto ou objeto paginado
  const response = await apiRequest<Professor[] | ProfessorsResponse>(endpoint);

  // Normaliza a resposta
  if (Array.isArray(response)) {
    return response;
  }
  return response.data || [];
}

/**
 * Busca um professor pelo ID
 *
 * @param id - UUID do professor
 * @returns Dados do professor
 *
 * @example
 * const professor = await getProfessorById('uuid-aqui');
 */
export async function getProfessorById(id: string): Promise<Professor> {
  return apiRequest<Professor>(`/professors/${id}`);
}

/**
 * Cria um novo professor
 *
 * @param data - Dados do novo professor
 * @returns Professor criado (com ID gerado)
 *
 * @example
 * const newProfessor = await createProfessor({
 *   name: 'Dr. João Silva',
 *   registration_number: 12345,
 *   institucional_email: 'joao.silva@universidade.edu.br',
 *   status: 'active'
 * });
 */
export async function createProfessor(
  data: ProfessorCreateRequest
): Promise<Professor> {
  return apiRequest<Professor>("/professors", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * Atualiza um professor existente
 *
 * @param id - UUID do professor
 * @param data - Dados para atualizar (apenas campos alterados)
 * @returns Professor atualizado
 *
 * @example
 * const updated = await updateProfessor('uuid', { status: 'inactive' });
 */
export async function updateProfessor(
  id: string,
  data: ProfessorUpdateRequest
): Promise<Professor> {
  return apiRequest<Professor>(`/professors/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * Remove um professor
 *
 * @param id - UUID do professor
 *
 * @example
 * await deleteProfessor('uuid-aqui');
 */
export async function deleteProfessor(id: string): Promise<void> {
  await apiRequest<void>(`/professors/${id}`, {
    method: "DELETE",
  });
}
