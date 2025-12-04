// Resources API Types

export enum ValueType {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
}

export interface Category {
  _id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Feature {
  _id: string;
  name: string;
  type: ValueType;
  categoryId: string | Category;
  createdAt?: string;
  updatedAt?: string;
}

export interface Resource {
  _id: string;
  name: string;
  quantity: number;
  status: boolean;
  categoryId: string | Category;
  createdAt?: string;
  updatedAt?: string;
}

export interface FeatureValue {
  _id: string;
  valueString?: string;
  valueNumber?: number;
  valueBoolean?: boolean;
  resourceId: string | Resource;
  featureId: string | Feature;
  createdAt?: string;
  updatedAt?: string;
}

// DTOs
export interface CreateCategoryDto {
  name: string;
}

export interface UpdateCategoryDto {
  name?: string;
}

export interface CreateFeatureDto {
  name: string;
  type: ValueType;
  categoryId: string;
}

export interface UpdateFeatureDto {
  name?: string;
  type?: ValueType;
  categoryId?: string;
}

export interface CreateResourceDto {
  name: string;
  quantity: number;
  status: boolean;
  categoryId: string;
}

export interface UpdateResourceDto {
  name?: string;
  quantity?: number;
  status?: boolean;
  categoryId?: string;
}

export interface CreateFeatureValueDto {
  valueString?: string;
  valueNumber?: number;
  valueBoolean?: boolean;
  resourceId: string;
  featureId: string;
}

export interface UpdateFeatureValueDto {
  valueString?: string;
  valueNumber?: number;
  valueBoolean?: boolean;
}
