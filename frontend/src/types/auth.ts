// Tipos baseados nas DTOs do backend OAuth API

export interface AuthRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token_type: string;
  access_token: string;
  expires_in: number;
  refresh_token: string;
  refresh_expires_in: number;
}

export interface UserRequest {
  username: string;
  password?: string;
  firstName: string;
  lastName: string;
}

export interface UserResponse {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  enabled: boolean;
}

export interface RoleRequest {
  name: string;
  description: string;
}

export interface RoleResponse {
  id: string | null;
  name: string;
  description: string;
  enabled: boolean;
}

export interface PasswordUpdateRequest {
  password: string;
}

export interface ApiError {
  error_code: string;
  error_description: string;
  error_source: string;
  error_stack: string[];
}

// Tipos específicos do frontend
export type UserRole = 'Administrador' | 'Coordenador' | 'Professor' | 'Aluno';

export interface User {
  name: string;
  role: UserRole;
  avatar: string;
  id?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  enabled?: boolean;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}