const API_BASE_URL = 'http://localhost:8080/api/v1';

export interface Task {
  id?: string;
  _id?: string;
  description: string;
  startDate?: string;
  start_date?: string;
  expectedEndDate?: string;
  expected_end_date?: string;
  actualEndDate?: string;
  actual_end_date?: string;
  employeeId?: string;
  employee_id?: string;
}

export interface TaskCreateRequest {
  description: string;
  startDate: string;
  expectedEndDate: string;
  actualEndDate?: string;
}

export interface TaskUpdateRequest {
  description?: string;
  startDate?: string;
  expectedEndDate?: string;
  actualEndDate?: string;
}

export interface TaskListParams {
  page?: number;
  limit?: number;
  description?: string;
  startDate?: string;
  endDate?: string;
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
  
  const responseText = await response.text();
  
  if (!response.ok) {
    let errorMessage = 'Erro ao processar requisição';
    
    if (responseText) {
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorData.error || errorData.detail || errorMessage;
        
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
        if (responseText.length < 200) {
          errorMessage = responseText;
        }
      }
    }
    
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
  
  if (response.status === 204) {
    return undefined as T;
  }
  
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

// Normalizar task para formato consistente
function normalizeTask(task: any): Task {
  return {
    id: task.id || task._id,
    _id: task._id || task.id,
    description: task.description || '',
    startDate: task.startDate || task.start_date,
    start_date: task.start_date || task.startDate,
    expectedEndDate: task.expectedEndDate || task.expected_end_date,
    expected_end_date: task.expected_end_date || task.expectedEndDate,
    actualEndDate: task.actualEndDate || task.actual_end_date,
    actual_end_date: task.actual_end_date || task.actualEndDate,
    employeeId: task.employeeId || task.employee_id,
    employee_id: task.employee_id || task.employeeId,
  };
}

export async function getEmployeeTasks(
  employeeId: string,
  params: TaskListParams = {}
): Promise<Task[]> {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.description) queryParams.append('description', params.description);
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  
  const queryString = queryParams.toString();
  const endpoint = `/employees/${employeeId}/tasks${queryString ? `?${queryString}` : ''}`;
  
  const response = await apiRequest<any>(endpoint);
  
  // O BFF pode retornar { data: [...] } ou diretamente um array
  let tasks: any[] = [];
  if (response) {
    if (response.data && Array.isArray(response.data)) {
      tasks = response.data;
    } else if (Array.isArray(response)) {
      tasks = response;
    } else if (response.tasks && Array.isArray(response.tasks)) {
      tasks = response.tasks;
    }
  }
  
  return tasks.map(normalizeTask);
}

export async function getEmployeeTask(
  employeeId: string,
  taskId: string
): Promise<Task> {
  const response = await apiRequest<any>(`/employees/${employeeId}/tasks/${taskId}`);
  const task = response?.data || response;
  return normalizeTask(task);
}

export async function createEmployeeTask(
  employeeId: string,
  data: TaskCreateRequest
): Promise<Task> {
  // Converter para camelCase (formato esperado pelo Spring Boot)
  const cleanedData: any = {
    description: data.description,
    startDate: data.startDate,
    expectedEndDate: data.expectedEndDate,
  };
  
  if (data.actualEndDate) {
    cleanedData.actualEndDate = data.actualEndDate;
  }
  
  const response = await apiRequest<any>(`/employees/${employeeId}/tasks`, {
    method: 'POST',
    body: JSON.stringify(cleanedData),
  });
  
  const task = response?.data || response;
  return normalizeTask(task);
}

export async function updateEmployeeTask(
  employeeId: string,
  taskId: string,
  data: TaskUpdateRequest
): Promise<Task> {
  // Converter para camelCase (formato esperado pelo Spring Boot)
  const cleanedData: any = {};
  
  if (data.description !== undefined && data.description !== null) {
    cleanedData.description = data.description;
  }
  
  if (data.startDate !== undefined && data.startDate !== null) {
    cleanedData.startDate = data.startDate;
  }
  
  if (data.expectedEndDate !== undefined && data.expectedEndDate !== null) {
    cleanedData.expectedEndDate = data.expectedEndDate;
  }
  
  if (data.actualEndDate !== undefined && data.actualEndDate !== null) {
    cleanedData.actualEndDate = data.actualEndDate;
  }
  
  const response = await apiRequest<any>(`/employees/${employeeId}/tasks/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(cleanedData),
  });
  
  const task = response?.data || response;
  return normalizeTask(task);
}

export async function patchEmployeeTask(
  employeeId: string,
  taskId: string,
  data: TaskUpdateRequest
): Promise<Task> {
  const cleanedData: any = {};
  
  if (data.description !== undefined && data.description !== null) {
    cleanedData.description = data.description;
  }
  
  if (data.startDate !== undefined && data.startDate !== null) {
    cleanedData.startDate = data.startDate;
  }
  
  if (data.expectedEndDate !== undefined && data.expectedEndDate !== null) {
    cleanedData.expectedEndDate = data.expectedEndDate;
  }
  
  if (data.actualEndDate !== undefined && data.actualEndDate !== null) {
    cleanedData.actualEndDate = data.actualEndDate;
  }
  
  const response = await apiRequest<any>(`/employees/${employeeId}/tasks/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify(cleanedData),
  });
  
  const task = response?.data || response;
  return normalizeTask(task);
}

export async function deleteEmployeeTask(
  employeeId: string,
  taskId: string
): Promise<void> {
  return apiRequest<void>(`/employees/${employeeId}/tasks/${taskId}`, {
    method: 'DELETE',
  });
}

