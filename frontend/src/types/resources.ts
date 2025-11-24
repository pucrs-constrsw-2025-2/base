// Types e Interfaces para o módulo Resources

export type ValueType = 'string' | 'number' | 'boolean' | 'date';

export type ResourceStatus = 'available' | 'in-use' | 'maintenance' | 'unavailable';

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Resource {
  id: string;
  name: string;
  categoryId: string;
  categoryName?: string; // Populado no frontend
  description?: string;
  status: ResourceStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Feature {
  id: string;
  name: string;
  categoryId: string;
  categoryName?: string; // Populado no frontend
  description?: string;
  valueType: ValueType;
  createdAt?: string;
  updatedAt?: string;
}

export interface FeatureValue {
  id: string;
  featureId: string;
  featureName?: string; // Populado no frontend
  resourceId: string;
  resourceName?: string; // Populado no frontend
  value: string | number | boolean | Date;
  createdAt?: string;
  updatedAt?: string;
}

// DTOs para criação/atualização
export interface CreateCategoryDto {
  name: string;
  description?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
}

export interface CreateResourceDto {
  name: string;
  categoryId: string;
  description?: string;
  status: ResourceStatus;
}

export interface UpdateResourceDto {
  name?: string;
  categoryId?: string;
  description?: string;
  status?: ResourceStatus;
}

export interface CreateFeatureDto {
  name: string;
  categoryId: string;
  description?: string;
  valueType: ValueType;
}

export interface UpdateFeatureDto {
  name?: string;
  categoryId?: string;
  description?: string;
  valueType?: ValueType;
}

export interface CreateFeatureValueDto {
  featureId: string;
  resourceId: string;
  value: string | number | boolean | Date;
}

export interface UpdateFeatureValueDto {
  value?: string | number | boolean | Date;
}

// Estado da aplicação
export interface ResourcesState {
  categories: Category[];
  resources: Resource[];
  features: Feature[];
  featureValues: FeatureValue[];
  selectedCategory: Category | null;
  selectedResource: Resource | null;
  loading: boolean;
  error: string | null;
}
