import { apiClient } from '../utils/apiClient';
import { AuthRequest, AuthResponse, User, UserRole } from '../types';

class AuthService {
  
  /**
   * Realiza login do usuário
   */
  async login(username: string, password: string): Promise<AuthResponse> {
    console.log('🔐 AuthService.login chamado');
    
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    console.log('📝 FormData criado:', { username });

    try {
      console.log('📡 Fazendo requisição POST /login...');
      const response = await apiClient.postFormData<AuthResponse>('/login', formData);
      console.log('✅ Resposta recebida:', {
        token_type: response.token_type,
        expires_in: response.expires_in,
        has_access_token: !!response.access_token,
        has_refresh_token: !!response.refresh_token
      });
      
      // Salvar tokens no localStorage
      console.log('💾 Salvando tokens...');
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      localStorage.setItem('token_expires_at', 
        (Date.now() + response.expires_in * 1000).toString()
      );
      
      // Definir token no apiClient
      apiClient.setToken(response.access_token);
      console.log('🔧 Token definido no apiClient');
      
      // Verificar se foi salvo
      const savedToken = localStorage.getItem('access_token');
      console.log('🔍 Verificação final - Token salvo:', savedToken ? 'SIM ✅' : 'NÃO ❌');
      
      return response;
    } catch (error: any) {
      console.error('❌ Erro na requisição de login:', error);
      console.error('📋 Detalhes completos:', {
        message: error.message,
        response_data: error.response?.data,
        response_status: error.response?.status,
        request_url: error.config?.url,
        request_method: error.config?.method
      });
      throw new Error(error.response?.data?.error_description || 'Erro ao fazer login');
    }
  }

  /**
   * Logout do usuário
   */
  logout(): void {
    // Limpar todos os dados do localStorage
    apiClient.clearToken();
    localStorage.removeItem('token_expires_at');
  }

  /**
   * Verifica se o usuário está autenticado
   */
  isAuthenticated(): boolean {
    const token = apiClient.getToken();
    const expiresAt = localStorage.getItem('token_expires_at');
    
    if (!token || !expiresAt) {
      return false;
    }

    // Verificar se o token não expirou
    const now = Date.now();
    const expiration = parseInt(expiresAt);
    
    if (now >= expiration) {
      this.logout();
      return false;
    }

    return true;
  }

  /**
   * Obtém o token atual
   */
  getToken(): string | null {
    return apiClient.getToken();
  }

  /**
   * Mapeia username para role (temporário até termos endpoint específico)
   */
  mapUsernameToRole(username: string): UserRole {
    const usernameLower = username.toLowerCase();
    
    if (usernameLower.includes('admin')) {
      return 'Administrador';
    } else if (usernameLower.includes('coord')) {
      return 'Coordenador';
    } else if (usernameLower.includes('prof')) {
      return 'Professor';
    }
    
    return 'Aluno';
  }

  /**
   * Obtém dados do usuário atual (mock temporário)
   */
  getCurrentUser(username: string): User {
    const role = this.mapUsernameToRole(username);
    
    const user: User = {
      name: username,
      role: role,
      avatar: 'https://images.unsplash.com/photo-1701463387028-3947648f1337?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9maWxlJTIwYXZhdGFyfGVufDF8fHx8MTc1Njc2ODA0MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      username: username
    };

    // Salvar dados do usuário
    localStorage.setItem('user_data', JSON.stringify(user));
    
    return user;
  }

  /**
   * Recupera dados do usuário do localStorage
   */
  getStoredUser(): User | null {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Refresh do token (implementação futura com refresh_token)
   */
  async refreshToken(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      throw new Error('Refresh token não encontrado');
    }

    // TODO: Implementar endpoint de refresh no backend
    // Por enquanto, força um novo login
    throw new Error('Refresh token não implementado');
  }

  /**
   * Verifica se o token está próximo de expirar (últimos 5 minutos)
   */
  isTokenExpiringSoon(): boolean {
    const expiresAt = localStorage.getItem('token_expires_at');
    
    if (!expiresAt) {
      return true;
    }

    const now = Date.now();
    const expiration = parseInt(expiresAt);
    const fiveMinutes = 5 * 60 * 1000; // 5 minutos em ms
    
    return (expiration - now) <= fiveMinutes;
  }
}

export const authService = new AuthService();