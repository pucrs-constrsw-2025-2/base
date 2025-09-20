import { apiClient } from '../utils/apiClient';
import { UserRequest, UserResponse, PasswordUpdateRequest } from '../types';

class UserService {

  /**
   * Criar novo usuário
   */
  async createUser(userData: UserRequest): Promise<UserResponse> {
    try {
      const response = await apiClient.post<UserResponse>('/users', userData);
      return response;
    } catch (error: any) {
      console.error('Erro ao criar usuário:', error);
      throw new Error(error.response?.data?.error_description || 'Erro ao criar usuário');
    }
  }

  /**
   * Buscar todos os usuários
   */
  async getUsers(enabled?: boolean): Promise<UserResponse[]> {
    try {
      const params = enabled !== undefined ? { enabled } : {};
      const response = await apiClient.get<UserResponse[]>('/users', { params });
      return response;
    } catch (error: any) {
      console.error('Erro ao buscar usuários:', error);
      throw new Error(error.response?.data?.error_description || 'Erro ao buscar usuários');
    }
  }

  /**
   * Buscar usuário por ID
   */
  async getUserById(userId: string): Promise<UserResponse> {
    try {
      const response = await apiClient.get<UserResponse>(`/users/${userId}`);
      return response;
    } catch (error: any) {
      console.error('Erro ao buscar usuário:', error);
      throw new Error(error.response?.data?.error_description || 'Erro ao buscar usuário');
    }
  }

  /**
   * Atualizar usuário
   */
  async updateUser(userId: string, userData: Omit<UserRequest, 'password'>): Promise<void> {
    try {
      await apiClient.put<void>(`/users/${userId}`, userData);
    } catch (error: any) {
      console.error('Erro ao atualizar usuário:', error);
      throw new Error(error.response?.data?.error_description || 'Erro ao atualizar usuário');
    }
  }

  /**
   * Atualizar senha do usuário
   */
  async updatePassword(userId: string, passwordData: PasswordUpdateRequest): Promise<void> {
    try {
      await apiClient.patch<void>(`/users/${userId}`, passwordData);
    } catch (error: any) {
      console.error('Erro ao atualizar senha:', error);
      throw new Error(error.response?.data?.error_description || 'Erro ao atualizar senha');
    }
  }

  /**
   * Desabilitar usuário (exclusão lógica)
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      await apiClient.delete<void>(`/users/${userId}`);
    } catch (error: any) {
      console.error('Erro ao deletar usuário:', error);
      throw new Error(error.response?.data?.error_description || 'Erro ao deletar usuário');
    }
  }

  /**
   * Buscar usuários ativos
   */
  async getActiveUsers(): Promise<UserResponse[]> {
    return this.getUsers(true);
  }

  /**
   * Buscar usuários inativos
   */
  async getInactiveUsers(): Promise<UserResponse[]> {
    return this.getUsers(false);
  }

  /**
   * Validar dados do usuário antes de enviar
   */
  validateUserData(userData: UserRequest): string[] {
    const errors: string[] = [];

    if (!userData.username || !userData.username.trim()) {
      errors.push('Username é obrigatório');
    }

    if (!userData.firstName || !userData.firstName.trim()) {
      errors.push('Nome é obrigatório');
    }

    if (!userData.lastName || !userData.lastName.trim()) {
      errors.push('Sobrenome é obrigatório');
    }

    // Validar email se username for email
    if (userData.username && userData.username.includes('@')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.username)) {
        errors.push('Email inválido');
      }
    }

    // Validar senha se fornecida
    if (userData.password) {
      if (userData.password.length < 6) {
        errors.push('Senha deve ter pelo menos 6 caracteres');
      }
    }

    return errors;
  }

  /**
   * Buscar usuários por filtro de texto
   */
  async searchUsers(searchTerm: string, enabled?: boolean): Promise<UserResponse[]> {
    try {
      const users = await this.getUsers(enabled);
      
      if (!searchTerm.trim()) {
        return users;
      }

      const term = searchTerm.toLowerCase();
      return users.filter(user => 
        user.username.toLowerCase().includes(term) ||
        user.firstName.toLowerCase().includes(term) ||
        user.lastName.toLowerCase().includes(term)
      );
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  }
}

export const userService = new UserService();