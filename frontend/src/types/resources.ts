// Types e Interfaces para o módulo Resources

export type ValueType = 'STRING' | 'NUMBER' | 'BOOLEAN';

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
  quantity: number;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Feature {
  id: string;
  name: string;
  categoryId: string;
  categoryName?: string; // Populado no frontend
  type: ValueType;
  createdAt?: string;
  updatedAt?: string;
}

export interface FeatureValue {
  id: string;
  featureId: string;
  featureName?: string; // Populado no frontend
  resourceId: string;
  resourceName?: string; // Populado no frontend
  valueString?: string;
  valueNumber?: number;
  valueBoolean?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// DTOs para criação/atualização
export interface CreateCategoryDto {
  name: string;
}

export interface UpdateCategoryDto {
  name?: string;
}

export interface CreateResourceDto {
  name: string;
  categoryId: string;
  quantity: number;
  status: boolean;
}

export interface UpdateResourceDto {
  name?: string;
  categoryId?: string;
  quantity?: number;
  status?: boolean;
}

export interface CreateFeatureDto {
  name: string;
  categoryId: string;
  type: ValueType;
}

export interface UpdateFeatureDto {
  name?: string;
  categoryId?: string;
  type?: ValueType;
}

export interface CreateFeatureValueDto {
  featureId: string;
  resourceId: string;
  valueString?: string;
  valueNumber?: number;
  valueBoolean?: boolean;
}

export interface UpdateFeatureValueDto {
  valueString?: string;
  valueNumber?: number;
  valueBoolean?: boolean;
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
