/**
 * Resources API Service
 * Cliente HTTP para integração com BFF - Módulo Resources
 * Base URL: /api/v1/resources
 */

import {
  Category,
  Resource,
  Feature,
  FeatureValue,
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateResourceDto,
  UpdateResourceDto,
  CreateFeatureDto,
  UpdateFeatureDto,
  CreateFeatureValueDto,
  UpdateFeatureValueDto,
  ValueType,
} from '../../types/resources';

// ============================================================================
// HELPERS
// ============================================================================

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
    throw new Error('Token de autenticação não encontrado. Faça login novamente.');
  }

  const baseUrl = (import.meta as any)?.env?.VITE_API_URL || 'http://localhost:8080';
  const url = `${baseUrl}/api/v1${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...(options.headers as HeadersInit),
  };

  const response = await fetch(url, { ...options, headers });

  // Ler resposta como texto
  const responseText = await response.text();

  if (!response.ok) {
    let errorMessage = 'Erro no servidor. Tente novamente mais tarde.';

    try {
      const errorData = JSON.parse(responseText);
      if (errorData.detail) errorMessage = errorData.detail;
      else if (errorData.message) errorMessage = errorData.message;
      else if (typeof errorData === 'string') errorMessage = errorData;
    } catch {
      // Se não conseguir parsear, usa mensagem genérica
    }

    throw new Error(errorMessage);
  }

  // Status 204 (No Content) retorna undefined
  if (response.status === 204 || !responseText) {
    return undefined as T;
  }

  // Parsear JSON
  try {
    const parsed = JSON.parse(responseText);
    // Se tem wrapper "data", retorna apenas o conteúdo
    if (parsed && parsed.data !== undefined) {
      return transformMongoResponse(parsed.data) as T;
    }
    return transformMongoResponse(parsed) as T;
  } catch (e) {
    console.error('Erro ao parsear JSON:', e, responseText);
    throw new Error('Resposta do servidor não é um JSON válido');
  }
}

/**
 * Transforma _id do MongoDB para id e extrai IDs de objetos populados
 */
function transformMongoResponse(data: any): any {
  if (!data) return data;
  
  // Se for array, transforma cada item
  if (Array.isArray(data)) {
    return data.map(item => transformMongoResponse(item));
  }
  
  // Se for objeto, transforma _id para id
  if (typeof data === 'object') {
    const transformed: any = {};
    for (const key in data) {
      if (key === '_id') {
        // _id vira id
        transformed.id = String(data[key]);
      } else if (key.endsWith('Id') && typeof data[key] === 'object' && data[key]?._id) {
        // Se o campo termina com "Id" e é um objeto populado, extrai apenas o _id
        transformed[key] = String(data[key]._id);
      } else {
        // Transforma recursivamente
        transformed[key] = transformMongoResponse(data[key]);
      }
    }
    return transformed;
  }
  
  return data;
}

// ============================================================================
// RESOURCES - 6 endpoints
// ============================================================================

export const resourcesApi = {
  /**
   * GET /api/v1/resources
   * Listar recursos (com filtro opcional por categoryId)
   */
  async list(params?: { categoryId?: string }): Promise<Resource[]> {
    const queryParams = new URLSearchParams();
    if (params?.categoryId) {
      queryParams.append('categoryId', params.categoryId);
    }

    const queryString = queryParams.toString();
    return apiRequest<Resource[]>(`/resources${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * POST /api/v1/resources
   * Criar recurso
   */
  async create(data: CreateResourceDto): Promise<Resource> {
    console.log('📤 Enviando para criação de recurso:', data);
    const result = await apiRequest<Resource>('/resources', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    console.log('📥 Resposta da criação de recurso:', result);
    return result;
  },

  /**
   * GET /api/v1/resources/{resourceId}
   * Buscar recurso por ID
   */
  async getById(resourceId: string): Promise<Resource> {
    return apiRequest<Resource>(`/resources/${resourceId}`);
  },

  /**
   * PUT /api/v1/resources/{resourceId}
   * Atualizar recurso (completo)
   */
  async update(resourceId: string, data: UpdateResourceDto): Promise<Resource> {
    return apiRequest<Resource>(`/resources/${resourceId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * PATCH /api/v1/resources/{resourceId}
   * Atualizar recurso (parcial)
   */
  async patch(resourceId: string, data: Partial<UpdateResourceDto>): Promise<Resource> {
    return apiRequest<Resource>(`/resources/${resourceId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * DELETE /api/v1/resources/{resourceId}
   * Deletar recurso
   */
  async delete(resourceId: string): Promise<void> {
    return apiRequest<void>(`/resources/${resourceId}`, {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// CATEGORIES - 10 endpoints
// ============================================================================

export const categoriesApi = {
  /**
   * GET /api/v1/resources/categories
   * Listar todas as categorias
   */
  async list(): Promise<Category[]> {
    return apiRequest<Category[]>('/resources/categories');
  },

  /**
   * POST /api/v1/resources/categories
   * Criar categoria
   */
  async create(data: CreateCategoryDto): Promise<Category> {
    return apiRequest<Category>('/resources/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * GET /api/v1/resources/categories/{categoryId}
   * Buscar categoria por ID
   */
  async getById(categoryId: string): Promise<Category> {
    return apiRequest<Category>(`/resources/categories/${categoryId}`);
  },

  /**
   * PUT /api/v1/resources/categories/{categoryId}
   * Atualizar categoria (completo)
   */
  async update(categoryId: string, data: UpdateCategoryDto): Promise<Category> {
    return apiRequest<Category>(`/resources/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * PATCH /api/v1/resources/categories/{categoryId}
   * Atualizar categoria (parcial)
   */
  async patch(categoryId: string, data: Partial<UpdateCategoryDto>): Promise<Category> {
    return apiRequest<Category>(`/resources/categories/${categoryId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * DELETE /api/v1/resources/categories/{categoryId}
   * Deletar categoria
   */
  async delete(categoryId: string): Promise<void> {
    return apiRequest<void>(`/resources/categories/${categoryId}`, {
      method: 'DELETE',
    });
  },

  /**
   * GET /api/v1/resources/categories/{categoryId}/resources
   * Listar recursos de uma categoria
   */
  async getResources(categoryId: string): Promise<Resource[]> {
    return apiRequest<Resource[]>(`/resources/categories/${categoryId}/resources`);
  },

  /**
   * POST /api/v1/resources/categories/{categoryId}/resources
   * Criar recurso em uma categoria
   */
  async createResource(categoryId: string, data: Omit<CreateResourceDto, 'categoryId'>): Promise<Resource> {
    return apiRequest<Resource>(`/resources/categories/${categoryId}/resources`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * GET /api/v1/resources/categories/{categoryId}/features
   * Listar features de uma categoria
   */
  async getFeatures(categoryId: string): Promise<Feature[]> {
    return apiRequest<Feature[]>(`/resources/categories/${categoryId}/features`);
  },

  /**
   * POST /api/v1/resources/categories/{categoryId}/features
   * Criar feature em uma categoria
   */
  async createFeature(categoryId: string, data: Omit<CreateFeatureDto, 'categoryId'>): Promise<Feature> {
    return apiRequest<Feature>(`/resources/categories/${categoryId}/features`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ============================================================================
// FEATURES - 7 endpoints
// ============================================================================

export const featuresApi = {
  /**
   * GET /api/v1/resources/features
   * Listar features (com filtro opcional por categoryId)
   */
  async list(params?: { categoryId?: string }): Promise<Feature[]> {
    const queryParams = new URLSearchParams();
    if (params?.categoryId) {
      queryParams.append('categoryId', params.categoryId);
    }

    const queryString = queryParams.toString();
    return apiRequest<Feature[]>(`/resources/features${queryString ? `?${queryString}` : ''}`);
  },

  /**
   * POST /api/v1/resources/features
   * Criar feature
   */
  async create(data: CreateFeatureDto): Promise<Feature> {
    return apiRequest<Feature>('/resources/features', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * GET /api/v1/resources/features/{featureId}
   * Buscar feature por ID
   */
  async getById(featureId: string): Promise<Feature> {
    return apiRequest<Feature>(`/resources/features/${featureId}`);
  },

  /**
   * PUT /api/v1/resources/features/{featureId}
   * Atualizar feature (completo)
   */
  async update(featureId: string, data: UpdateFeatureDto): Promise<Feature> {
    return apiRequest<Feature>(`/resources/features/${featureId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * PATCH /api/v1/resources/features/{featureId}
   * Atualizar feature (parcial)
   */
  async patch(featureId: string, data: Partial<UpdateFeatureDto>): Promise<Feature> {
    return apiRequest<Feature>(`/resources/features/${featureId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * DELETE /api/v1/resources/features/{featureId}
   * Deletar feature
   */
  async delete(featureId: string): Promise<void> {
    return apiRequest<void>(`/resources/features/${featureId}`, {
      method: 'DELETE',
    });
  },

  /**
   * GET /api/v1/resources/features/category/{categoryId}
   * Buscar features por categoria
   */
  async getByCategory(categoryId: string): Promise<Feature[]> {
    return apiRequest<Feature[]>(`/resources/features/category/${categoryId}`);
  },
};

// ============================================================================
// FEATURE VALUES - 13 endpoints
// ============================================================================

export const featureValuesApi = {
  /**
   * GET /api/v1/resources/feature-values
   * Listar todos os feature values
   */
  async list(): Promise<FeatureValue[]> {
    return apiRequest<FeatureValue[]>('/resources/feature-values');
  },

  /**
   * POST /api/v1/resources/feature-values
   * Criar feature value
   */
  async create(data: CreateFeatureValueDto): Promise<FeatureValue> {
    console.log('📤 Enviando para criação de feature value:', data);
    const result = await apiRequest<FeatureValue>('/resources/feature-values', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    console.log('📥 Resposta da criação de feature value:', result);
    return result;
  },

  /**
   * GET /api/v1/resources/feature-values/{featureValueId}
   * Buscar feature value por ID
   */
  async getById(featureValueId: string): Promise<FeatureValue> {
    return apiRequest<FeatureValue>(`/resources/feature-values/${featureValueId}`);
  },

  /**
   * PATCH /api/v1/resources/feature-values/{featureValueId}
   * Atualizar feature value
   */
  async patch(featureValueId: string, data: UpdateFeatureValueDto): Promise<FeatureValue> {
    console.log('📤 Atualizando feature value:', featureValueId, data);
    const result = await apiRequest<FeatureValue>(`/resources/feature-values/${featureValueId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    console.log('📥 Feature value atualizado:', result);
    return result;
  },

  /**
   * DELETE /api/v1/resources/feature-values/{featureValueId}
   * Deletar feature value
   */
  async delete(featureValueId: string): Promise<void> {
    return apiRequest<void>(`/resources/feature-values/${featureValueId}`, {
      method: 'DELETE',
    });
  },

  /**
   * GET /api/v1/resources/feature-values/resource/{resourceId}
   * Buscar feature values por recurso
   */
  async getByResource(resourceId: string): Promise<FeatureValue[]> {
    console.log('📤 Buscando feature values do recurso:', resourceId);
    
    // WORKAROUND: Buscar todas e filtrar localmente porque o endpoint /resource/{id} está retornando vazio
    const allFeatureValues = await apiRequest<FeatureValue[]>(`/resources/feature-values`);
    console.log('📦 Todas as feature values:', allFeatureValues);
    
    const filtered = allFeatureValues.filter(fv => fv.resourceId === resourceId);
    console.log('📥 Feature values filtrados para resourceId', resourceId, ':', filtered);
    
    return filtered;
  },

  /**
   * GET /api/v1/resources/feature-values/feature/{featureId}
   * Buscar feature values por feature
   */
  async getByFeature(featureId: string): Promise<FeatureValue[]> {
    return apiRequest<FeatureValue[]>(`/resources/feature-values/feature/${featureId}`);
  },

  /**
   * GET /api/v1/resources/feature-values/resources/{resourceId}/features
   * Listar feature values de um recurso
   */
  async listByResource(resourceId: string): Promise<FeatureValue[]> {
    return apiRequest<FeatureValue[]>(`/resources/feature-values/resources/${resourceId}/features`);
  },

  /**
   * POST /api/v1/resources/feature-values/resources/{resourceId}/features
   * Criar feature value para um recurso
   */
  async createForResource(resourceId: string, data: Omit<CreateFeatureValueDto, 'resourceId'>): Promise<FeatureValue> {
    // O microserviço espera o DTO completo mas sobrescreve o resourceId da URL
    const fullData = { ...data, resourceId };
    return apiRequest<FeatureValue>(`/resources/feature-values/resources/${resourceId}/features`, {
      method: 'POST',
      body: JSON.stringify(fullData),
    });
  },

  /**
   * GET /api/v1/resources/feature-values/resources/{resourceId}/features/{featureValueId}
   * Buscar feature value específico
   */
  async getResourceFeatureValue(resourceId: string, featureValueId: string): Promise<FeatureValue> {
    return apiRequest<FeatureValue>(`/resources/feature-values/resources/${resourceId}/features/${featureValueId}`);
  },

  /**
   * PATCH /api/v1/resources/feature-values/resources/{resourceId}/features/{featureValueId}
   * Atualizar feature value
   */
  async patchResourceFeatureValue(
    resourceId: string,
    featureValueId: string,
    data: UpdateFeatureValueDto
  ): Promise<FeatureValue> {
    return apiRequest<FeatureValue>(`/resources/feature-values/resources/${resourceId}/features/${featureValueId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * DELETE /api/v1/resources/feature-values/resources/{resourceId}/features/{featureValueId}
   * Deletar feature value
   */
  async deleteResourceFeatureValue(resourceId: string, featureValueId: string): Promise<void> {
    return apiRequest<void>(`/resources/feature-values/resources/${resourceId}/features/${featureValueId}`, {
      method: 'DELETE',
    });
  },
};

// ============================================================================
// VALUE TYPES - 1 endpoint
// ============================================================================

export const valueTypesApi = {
  /**
   * GET /api/v1/resources/value-types
   * Listar tipos de valores disponíveis (enum)
   */
  async list(): Promise<ValueType[]> {
    return apiRequest<ValueType[]>('/resources/value-types');
  },
};

// ============================================================================
// EXPORT ALL
// ============================================================================

export const resourcesApiService = {
  resources: resourcesApi,
  categories: categoriesApi,
  features: featuresApi,
  featureValues: featureValuesApi,
  valueTypes: valueTypesApi,
};

export default resourcesApiService;
