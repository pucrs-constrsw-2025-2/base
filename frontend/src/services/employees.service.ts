const API_BASE_URL = 'http://localhost:8080/api/v1';

export interface Employee {
  _id?: string;
  id?: string;
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

// Normalizar employee para garantir compatibilidade com id/_id e camelCase/snake_case
function normalizeEmployee(employee: any): Employee {
  if (!employee) return employee;
  
  console.log('=== normalizeEmployee - INÍCIO ===');
  console.log('Employee raw completo:', JSON.stringify(employee, null, 2));
  console.log('Campo room antes da normalização:', employee.room);
  console.log('Tipo do campo room:', typeof employee.room);
  console.log('Campo room é null?', employee.room === null);
  console.log('Campo room é undefined?', employee.room === undefined);
  
  // Normalizar room se existir (aceitar tanto idRoom quanto id)
  let normalizedRoom = undefined;
  if (employee.room !== null && employee.room !== undefined) {
    console.log('Campo room existe, processando...');
    // Aceitar tanto objeto quanto string
    if (typeof employee.room === 'object' && employee.room !== null) {
      console.log('Room é um objeto:', employee.room);
      console.log('Chaves do objeto room:', Object.keys(employee.room));
      // Aceitar tanto idRoom (camelCase) quanto id, _id, idRoom (qualquer variação)
      // O Jackson pode serializar getIdRoom() como "idRoom" ou o OpenAPI pode documentar como "id"
      const roomId = employee.room.idRoom || 
                     employee.room.id || 
                     employee.room._id ||
                     employee.room._idRoom ||
                     (employee.room as any).id_room ||
                     (employee.room as any).roomId;
      console.log('ID da sala encontrado no objeto room:', roomId);
      console.log('Tentativas de extração:');
      console.log('  - idRoom:', employee.room.idRoom);
      console.log('  - id:', employee.room.id);
      console.log('  - _id:', employee.room._id);
      console.log('  - _idRoom:', employee.room._idRoom);
      console.log('  - id_room:', (employee.room as any).id_room);
      console.log('  - roomId:', (employee.room as any).roomId);
      
      if (roomId) {
        normalizedRoom = {
          idRoom: String(roomId).trim(),
        };
        console.log('Room normalizado criado:', normalizedRoom);
      } else {
        console.warn('Nenhum ID de sala encontrado no objeto room');
      }
    } else if (typeof employee.room === 'string' && employee.room.trim() !== '') {
      // Se room for uma string (ID direto), criar objeto
      console.log('Room é uma string (ID direto):', employee.room);
      normalizedRoom = {
        idRoom: employee.room.trim(),
      };
      console.log('Room normalizado criado (string):', normalizedRoom);
    } else {
      console.warn('Room tem tipo inesperado ou está vazio:', typeof employee.room, employee.room);
    }
  } else {
    console.log('Campo room é null ou undefined, não será normalizado');
  }
  
  console.log('Room normalizado final:', normalizedRoom);
  console.log('=== normalizeEmployee - FIM ===');
  
  const normalized: any = {
    // IDs: aceitar tanto _id quanto id
    _id: employee._id || employee.id,
    id: employee.id || employee._id,
    // Contract number: aceitar tanto contractNumber (camelCase do backend) quanto contract_number (snake_case do frontend)
    contract_number: employee.contract_number !== undefined 
      ? employee.contract_number 
      : (employee.contractNumber !== undefined ? employee.contractNumber : undefined),
    // Organizational unit: aceitar tanto organizationalUnit (camelCase do backend) quanto organizational_unit (snake_case do frontend)
    organizational_unit: employee.organizational_unit !== undefined 
      ? employee.organizational_unit 
      : (employee.organizationalUnit !== undefined ? employee.organizationalUnit : undefined),
    // Outros campos (aceitar tanto camelCase quanto snake_case)
    name: employee.name,
    role: employee.role,
    salary: employee.salary,
    room: normalizedRoom,
    tasks: employee.tasks,
  };
  
  // Garantir que ambos os IDs estejam presentes para compatibilidade
  if (!normalized._id && normalized.id) {
    normalized._id = normalized.id;
  }
  if (!normalized.id && normalized._id) {
    normalized.id = normalized._id;
  }
  
  console.log('Employee normalizado:', normalized);
  
  return normalized as Employee;
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
  let employeeListResponse: EmployeeListResponse;
  if (response && response.data) {
    employeeListResponse = response.data as EmployeeListResponse;
  } else if (response && Array.isArray(response.employees)) {
    employeeListResponse = response as EmployeeListResponse;
  } else {
    // Se não encontrou employees, retornar estrutura vazia
    console.warn('Estrutura de resposta inesperada:', response);
    return {
      employees: [],
      total: 0,
      page: params.page || 1,
      limit: params.size || 10,
    };
  }
  
  // Normalizar employees para garantir que tenham tanto _id quanto id e campos em snake_case
  if (employeeListResponse.employees) {
    employeeListResponse.employees = employeeListResponse.employees.map(normalizeEmployee);
  }
  
  return employeeListResponse;
}

export async function getEmployeeById(id: string): Promise<Employee> {
  const response = await apiRequest<any>(`/employees/${id}`);
  // O BFF envolve a resposta em { data: {...}, meta: {...} }
  const rawEmployee = (response?.data || response) as any;
  console.log('=== getEmployeeById - Employee raw do backend ===');
  console.log('Resposta completa:', JSON.stringify(rawEmployee, null, 2));
  console.log('Campo room na resposta raw:', rawEmployee?.room);
  console.log('Tipo do campo room:', typeof rawEmployee?.room);
  console.log('Campo room (JSON):', JSON.stringify(rawEmployee?.room, null, 2));
  
  const employee = normalizeEmployee(rawEmployee);
  console.log('=== getEmployeeById - Employee normalizado ===');
  console.log('Employee normalizado:', employee);
  console.log('Campo room normalizado:', employee?.room);
  console.log('Campo room normalizado (JSON):', JSON.stringify(employee?.room, null, 2));
  return employee;
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
  const employee = (response?.data || response) as Employee;
  return normalizeEmployee(employee);
}

export async function updateEmployee(
  id: string,
  data: EmployeeUpdateRequest
): Promise<Employee> {
  // O EmployeeUpdateRequest no backend Java aceita APENAS:
  // - salary (BigDecimal)
  // - organizationalUnit (String)
  // - room (RoomReferenceDto)
  // 
  // NÃO aceita: contractNumber, name, role (esses campos não podem ser atualizados)
  const cleanedData: any = {};
  
  // Apenas incluir salary se estiver definido
  if (data.salary !== undefined && data.salary !== null) {
    cleanedData.salary = data.salary;
  }
  
  // Apenas incluir organizationalUnit se estiver definido e não vazio
  if (data.organizational_unit !== undefined && data.organizational_unit !== null && data.organizational_unit.trim() !== '') {
    cleanedData.organizationalUnit = data.organizational_unit;
  }
  
  // Sempre incluir o campo room se ele existir, mesmo que seja para remover a sala (room: null)
  if (data.room !== undefined) {
    if (data.room && data.room.idRoom && data.room.idRoom.trim() !== '') {
      cleanedData.room = { idRoom: data.room.idRoom };
      console.log('Incluindo sala no update:', cleanedData.room);
    } else {
      // Se room for explicitamente null/undefined, não incluir (manter o valor atual no banco)
      console.log('Campo room não será atualizado (mantendo valor atual)');
    }
  }

  console.log('Enviando dados para atualizar funcionário:', cleanedData);
  console.log('Dados completos (incluindo room):', JSON.stringify(cleanedData, null, 2));
  
  const response = await apiRequest<any>(`/employees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(cleanedData),
  });
  
  // O BFF envolve a resposta em { data: {...}, meta: {...} }
  const employee = (response?.data || response) as Employee;
  return normalizeEmployee(employee);
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

