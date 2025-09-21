import api from './config';

// Interface para as credenciais de login
export interface LoginCredentials {
  username: string;
  password: string;
}

// Interface para a resposta do token (ajuste se a sua for diferente)
export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  refresh_expires_in: number;
}

// Função que chama a API para fazer login
export const login = async (credentials: LoginCredentials): Promise<TokenResponse> => {
  try {
    const response = await api.post<TokenResponse>('/users/login', credentials);
    return response.data;
  } catch (error) {
    console.error("Erro na chamada de login:", error);
    throw error;
  }
};