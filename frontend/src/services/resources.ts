// Services para consumir o BFF (porta 8080, prefixo /api/v1) do módulo Resources.
// Baseado nos contratos de backend/resources (OpenAPI) e espelhados no backend/bff.

const API_BASE =
  `${(import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(/\/$/, '')}/v1`;

type UUID = string;

// Categorias
export interface CategoryResponse {
  id: string;
  name: string;
  description?: string;
}

export interface CategoryCreateRequest {
  name: string;
  description?: string;
}

export interface CategoryUpdateRequest {
  name?: string;
  description?: string;
}

// Recursos
export interface ResourceResponse {
  id: UUID;
  name: string;
  description?: string;
  categoryId: string;
}

export interface ResourceCreateRequest {
  name: string;
  description?: string;
  categoryId: string;
}

export interface ResourceUpdateRequest {
  name?: string;
  description?: string;
  categoryId?: string;
}

// Features
export interface FeatureResponse {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
}

export interface FeatureCreateRequest {
  name: string;
  description?: string;
  categoryId: string;
}

export interface FeatureUpdateRequest {
  name?: string;
  description?: string;
  categoryId?: string;
}

// Feature Values
export interface FeatureValueResponse {
  id: string;
  value: string;
  featureId: string;
  resourceId: UUID;
}

export interface FeatureValueCreateRequest {
  value: string;
  featureId: string;
  resourceId: UUID;
}

export interface FeatureValueUpdateRequest {
  value?: string;
  featureId?: string;
  resourceId?: UUID;
}

// Value Types (enum textual vindo do backend)
export type ValueType = string;

function getAuthToken(): string | null {
  // Ajuste aqui se o token for salvo com outra chave.
  return sessionStorage.getItem('access_token');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || res.statusText);
  }

  if (res.status === 204) {
    // @ts-expect-error retorno vazio quando não há corpo
    return undefined;
  }

  return (await res.json()) as T;
}

// ---------- Categorias ----------
export const CategoriesApi = {
  list: () => request<CategoryResponse[]>('/resources/categories'),
  get: (categoryId: string) => request<CategoryResponse>(`/resources/categories/${categoryId}`),
  create: (data: CategoryCreateRequest) =>
    request<CategoryResponse>('/resources/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (categoryId: string, data: CategoryUpdateRequest) =>
    request<CategoryResponse>(`/resources/categories/${categoryId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  replace: (categoryId: string, data: CategoryCreateRequest) =>
    request<CategoryResponse>(`/resources/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  remove: (categoryId: string) =>
    request<void>(`/resources/categories/${categoryId}`, { method: 'DELETE' }),
  listResources: (categoryId: string) =>
    request<ResourceResponse[]>(`/categories/${categoryId}/resources`),
  createResource: (categoryId: string, data: ResourceCreateRequest) =>
    request<ResourceResponse>(`/categories/${categoryId}/resources`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  listFeatures: (categoryId: string) =>
    request<FeatureResponse[]>(`/categories/${categoryId}/features`),
  createFeature: (categoryId: string, data: FeatureCreateRequest) =>
    request<FeatureResponse>(`/categories/${categoryId}/features`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ---------- Recursos ----------
export const ResourcesApi = {
  list: (categoryId?: string) => {
    const qs = categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : '';
    return request<ResourceResponse[]>(`/resources${qs}`);
  },
  get: (resourceId: UUID) => request<ResourceResponse>(`/resources/${resourceId}`),
  create: (data: ResourceCreateRequest) =>
    request<ResourceResponse>('/resources', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  replace: (resourceId: UUID, data: ResourceCreateRequest) =>
    request<ResourceResponse>(`/resources/${resourceId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  patch: (resourceId: UUID, data: ResourceUpdateRequest) =>
    request<ResourceResponse>(`/resources/${resourceId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  remove: (resourceId: UUID) =>
    request<void>(`/resources/${resourceId}`, { method: 'DELETE' }),
};

// ---------- Features ----------
export const FeaturesApi = {
  list: (categoryId?: string) => {
    const qs = categoryId ? `?categoryId=${encodeURIComponent(categoryId)}` : '';
    return request<FeatureResponse[]>(`/resources/features${qs}`);
  },
  get: (featureId: string) => request<FeatureResponse>(`/resources/features/${featureId}`),
  create: (data: FeatureCreateRequest) =>
    request<FeatureResponse>('/resources/features', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  replace: (featureId: string, data: FeatureCreateRequest) =>
    request<FeatureResponse>(`/resources/features/${featureId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  patch: (featureId: string, data: FeatureUpdateRequest) =>
    request<FeatureResponse>(`/resources/features/${featureId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  remove: (featureId: string) =>
    request<void>(`/resources/features/${featureId}`, { method: 'DELETE' }),
  listByCategory: (categoryId: string) =>
    request<FeatureResponse[]>(`/resources/features/category/${categoryId}`),
};

// ---------- Feature Values ----------
export const FeatureValuesApi = {
  list: () => request<FeatureValueResponse[]>('/resources/feature-values'),
  get: (featureValueId: string) =>
    request<FeatureValueResponse>(`/resources/feature-values/${featureValueId}`),
  create: (data: FeatureValueCreateRequest) =>
    request<FeatureValueResponse>('/resources/feature-values', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  patch: (featureValueId: string, data: FeatureValueUpdateRequest) =>
    request<FeatureValueResponse>(`/resources/feature-values/${featureValueId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  remove: (featureValueId: string) =>
    request<void>(`/resources/feature-values/${featureValueId}`, { method: 'DELETE' }),

  listByResource: (resourceId: UUID) =>
    request<FeatureValueResponse[]>(`/feature-values/resource/${resourceId}`),
  listByFeature: (featureId: string) =>
    request<FeatureValueResponse[]>(`/feature-values/feature/${featureId}`),

  listResourceFeatureValues: (resourceId: UUID) =>
    request<FeatureValueResponse[]>(`/feature-values/resources/${resourceId}/features`),
  createResourceFeatureValue: (resourceId: UUID, data: FeatureValueCreateRequest) =>
    request<FeatureValueResponse>(`/feature-values/resources/${resourceId}/features`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getResourceFeatureValue: (resourceId: UUID, featureValueId: string) =>
    request<FeatureValueResponse>(
      `/feature-values/resources/${resourceId}/features/${featureValueId}`,
    ),
  patchResourceFeatureValue: (
    resourceId: UUID,
    featureValueId: string,
    data: FeatureValueUpdateRequest,
  ) =>
    request<FeatureValueResponse>(
      `/feature-values/resources/${resourceId}/features/${featureValueId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      },
    ),
  deleteResourceFeatureValue: (resourceId: UUID, featureValueId: string) =>
    request<void>(`/feature-values/resources/${resourceId}/features/${featureValueId}`, {
      method: 'DELETE',
    }),
};

// ---------- Value Types ----------
export const ValueTypesApi = {
  list: () => request<ValueType[]>('/resources/value-types'),
};
