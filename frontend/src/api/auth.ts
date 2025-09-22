import api from './config';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  refresh_expires_in: number;
}

export const login = async (credentials: LoginCredentials): Promise<TokenResponse> => {
  try {
    const response = await api.post<TokenResponse>('/users/login', credentials);
    return response.data;
  } catch (error) {
    console.error("Erro na chamada de login:", error);
    throw error;
  }
};