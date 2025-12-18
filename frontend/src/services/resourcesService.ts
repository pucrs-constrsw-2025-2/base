// Resources API Service
import { httpClient } from './api';
import type {
  Category,
  Feature,
  Resource,
  FeatureValue,
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateFeatureDto,
  UpdateFeatureDto,
  CreateResourceDto,
  UpdateResourceDto,
  CreateFeatureValueDto,
  UpdateFeatureValueDto,
} from '../types/resources';

// Categories
export const categoriesService = {
  getAll: () => httpClient.get<Category[]>('/categories'),
  getById: (id: string) => httpClient.get<Category>(`/categories/${id}`),
  create: (data: CreateCategoryDto) => httpClient.post<Category>('/categories', data),
  update: (id: string, data: UpdateCategoryDto) => httpClient.patch<Category>(`/categories/${id}`, data),
  delete: (id: string) => httpClient.delete(`/categories/${id}`),
};

// Features
export const featuresService = {
  getAll: () => httpClient.get<Feature[]>('/features'),
  getById: (id: string) => httpClient.get<Feature>(`/features/${id}`),
  getByCategory: (categoryId: string) => httpClient.get<Feature[]>(`/features/category/${categoryId}`),
  create: (data: CreateFeatureDto) => httpClient.post<Feature>('/features', data),
  update: (id: string, data: UpdateFeatureDto) => httpClient.patch<Feature>(`/features/${id}`, data),
  delete: (id: string) => httpClient.delete(`/features/${id}`),
};

// Resources
export const resourcesService = {
  getAll: () => httpClient.get<Resource[]>('/resources'),
  getById: (id: string) => httpClient.get<Resource>(`/resources/${id}`),
  getByCategory: (categoryId: string) => httpClient.get<Resource[]>(`/resources/category/${categoryId}`),
  create: (data: CreateResourceDto) => httpClient.post<Resource>('/resources', data),
  update: (id: string, data: UpdateResourceDto) => httpClient.patch<Resource>(`/resources/${id}`, data),
  delete: (id: string) => httpClient.delete(`/resources/${id}`),
};

// Feature Values
export const featureValuesService = {
  getAll: () => httpClient.get<FeatureValue[]>('/feature-values'),
  getById: (id: string) => httpClient.get<FeatureValue>(`/feature-values/${id}`),
  getByResource: (resourceId: string) => httpClient.get<FeatureValue[]>(`/feature-values/resource/${resourceId}`),
  getByFeature: (featureId: string) => httpClient.get<FeatureValue[]>(`/feature-values/feature/${featureId}`),
  create: (data: CreateFeatureValueDto) => httpClient.post<FeatureValue>('/feature-values', data),
  update: (id: string, data: UpdateFeatureValueDto) => httpClient.patch<FeatureValue>(`/feature-values/${id}`, data),
  delete: (id: string) => httpClient.delete(`/feature-values/${id}`),
};
