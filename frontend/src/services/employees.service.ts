const API_BASE_URL = 'http://localhost:8080/api/v1';

export interface Employee {
  _id: string;
  contract_number: number;
  name: string;
  role: string;
  salary?: number;
  organizational_unit?: string;
  room?: {
    idRoom: string;
  };
  tasks?: any[];
}

export interface EmployeeCreateRequest {
  contract_number: number;
  name: string;
  role: string;
  salary?: number;
  organizational_unit?: string;
  room?: {
    idRoom: string;
  };
}

export interface EmployeeUpdateRequest {
  contract_number?: number;
  name?: string;
  role?: string;
  salary?: number;
  organizational_unit?: string;
  room?: {
    idRoom: string;
  };
}

export interface EmployeeListResponse {
  employees: Employee[];
  total: number;
  page: number;
  limit: number;
}

export interface PaginationParams {
  page?: number;
  size?: number; // BFF usa 'size', não 'limit'
  search?: string;
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
  
  // Ler o body como texto primeiro (só podemos ler uma vez)
  const responseText = await response.text();
  
  if (!response.ok) {
    let errorMessage = 'Erro ao processar requisição';
    
    // Tentar parsear a resposta de erro
    if (responseText) {
      try {
        const errorData = JSON.parse(responseText);
        console.error('Erro da API:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
        });
        
        errorMessage = errorData.message || errorData.error || errorData.detail || errorMessage;
        
        // Se houver validações, adicionar detalhes
        if (errorData.errors || errorData.validationErrors) {
          const validationErrors = errorData.errors || errorData.validationErrors;
          if (Array.isArray(validationErrors)) {
            const errorDetails = validationErrors.map((e: any) => 
              e.message || e.field || String(e)
            ).join(', ');
            errorMessage = `${errorMessage}: ${errorDetails}`;
          }
        }
      } catch {
        // Se não for JSON, usar o texto se for curto
        console.error('Erro da API (texto):', {
          status: response.status,
          statusText: response.statusText,
          body: responseText,
        });
        if (responseText.length < 200) {
          errorMessage = responseText;
        }
      }
    }
    
    // Mensagens específicas por status
    if (response.status === 401) {
      errorMessage = 'Não autorizado. Faça login novamente.';
    } else if (response.status === 404) {
      errorMessage = 'Recurso não encontrado';
    } else if (response.status === 400) {
      errorMessage = errorMessage || 'Dados inválidos. Verifique os campos preenchidos.';
    } else if (response.status >= 500) {
      errorMessage = errorMessage || 'Erro no servidor. Tente novamente mais tarde.';
    }
    
    throw new Error(errorMessage);
  }
  
  // Se a resposta for 204 No Content, retornar void
  if (response.status === 204) {
    return undefined as T;
  }
  
  // Parsear JSON da resposta de sucesso
  if (!responseText) {
    return undefined as T;
  }
  
  try {
    return JSON.parse(responseText) as T;
  } catch (parseError) {
    console.error('Erro ao parsear resposta JSON:', parseError, responseText);
    throw new Error('Resposta do servidor não é um JSON válido');
  }
}

export async function getEmployees(
  params: PaginationParams = {}
): Promise<EmployeeListResponse> {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.size) queryParams.append('size', params.size.toString());
  if (params.search) queryParams.append('search', params.search);
  
  const queryString = queryParams.toString();
  const endpoint = `/employees${queryString ? `?${queryString}` : ''}`;
  
  const response = await apiRequest<any>(endpoint);
  
  // O BFF envolve a resposta em { data: {...}, meta: {...} }
  // Precisamos extrair o campo 'data'
  if (response && response.data) {
    return response.data as EmployeeListResponse;
  }
  
  // Fallback: se a resposta já está no formato correto (sem wrapper)
  if (response && Array.isArray(response.employees)) {
    return response as EmployeeListResponse;
  }
  
  // Se não encontrou employees, retornar estrutura vazia
  console.warn('Estrutura de resposta inesperada:', response);
  return {
    employees: [],
    total: 0,
    page: params.page || 1,
    limit: params.size || 10,
  };
}

export async function getEmployeeById(id: string): Promise<Employee> {
  const response = await apiRequest<any>(`/employees/${id}`);
  // O BFF envolve a resposta em { data: {...}, meta: {...} }
  return (response?.data || response) as Employee;
}

export async function createEmployee(
  data: EmployeeCreateRequest
): Promise<Employee> {
  // Converter para camelCase (formato esperado pelo Spring Boot)
  const cleanedData: any = {
    contractNumber: data.contract_number,
    name: data.name,
    role: data.role,
  };
  
  if (data.salary !== undefined && data.salary !== null) {
    cleanedData.salary = data.salary;
  }
  
  if (data.organizational_unit && data.organizational_unit.trim() !== '') {
    cleanedData.organizationalUnit = data.organizational_unit;
  }
  
  if (data.room && data.room.idRoom && data.room.idRoom.trim() !== '') {
    cleanedData.room = { idRoom: data.room.idRoom };
  }
  
  console.log('Enviando dados para criar funcionário:', cleanedData);
  
  const response = await apiRequest<any>('/employees', {
    method: 'POST',
    body: JSON.stringify(cleanedData),
  });
  
  // O BFF envolve a resposta em { data: {...}, meta: {...} }
  return (response?.data || response) as Employee;
}

export async function updateEmployee(
  id: string,
  data: EmployeeUpdateRequest
): Promise<Employee> {
  // Converter para camelCase (formato esperado pelo Spring Boot)
  const cleanedData: any = {};
  
  if (data.contract_number !== undefined && data.contract_number !== null) {
    cleanedData.contractNumber = data.contract_number;
  }
  
  if (data.name !== undefined && data.name !== null && data.name.trim() !== '') {
    cleanedData.name = data.name;
  }
  
  if (data.role !== undefined && data.role !== null && data.role.trim() !== '') {
    cleanedData.role = data.role;
  }
  
  if (data.salary !== undefined && data.salary !== null) {
    cleanedData.salary = data.salary;
  }
  
  if (data.organizational_unit !== undefined && data.organizational_unit !== null && data.organizational_unit.trim() !== '') {
    cleanedData.organizationalUnit = data.organizational_unit;
  }
  
  if (data.room && data.room.idRoom && data.room.idRoom.trim() !== '') {
    cleanedData.room = { idRoom: data.room.idRoom };
  }
  
  console.log('Enviando dados para atualizar funcionário:', cleanedData);
  
  const response = await apiRequest<any>(`/employees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(cleanedData),
  });
  
  // O BFF envolve a resposta em { data: {...}, meta: {...} }
  return (response?.data || response) as Employee;
}

export async function patchEmployee(
  id: string,
  data: EmployeeUpdateRequest
): Promise<Employee> {
  return apiRequest<Employee>(`/employees/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteEmployee(id: string): Promise<void> {
  return apiRequest<void>(`/employees/${id}`, {
    method: 'DELETE',
  });
}

