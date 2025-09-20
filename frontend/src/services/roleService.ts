import { apiClient } from '../utils/apiClient';
import { RoleRequest, RoleResponse } from '../types';

class RoleService {

  /**
   * Criar nova role
   */
  async createRole(roleData: RoleRequest): Promise<RoleResponse> {
    try {
      const response = await apiClient.post<RoleResponse>('/roles', roleData);
      return response;
    } catch (error: any) {
      console.error('Erro ao criar role:', error);
      throw new Error(error.response?.data?.error_description || 'Erro ao criar role');
    }
  }

  /**
   * Buscar todas as roles
   */
  async getRoles(): Promise<RoleResponse[]> {
    try {
      const response = await apiClient.get<RoleResponse[]>('/roles');
      return response;
    } catch (error: any) {
      console.error('Erro ao buscar roles:', error);
      throw new Error(error.response?.data?.error_description || 'Erro ao buscar roles');
    }
  }

  /**
   * Buscar role por ID ou nome
   */
  async getRoleById(roleId: string): Promise<RoleResponse> {
    try {
      const response = await apiClient.get<RoleResponse>(`/roles/${roleId}`);
      return response;
    } catch (error: any) {
      console.error('Erro ao buscar role:', error);
      throw new Error(error.response?.data?.error_description || 'Erro ao buscar role');
    }
  }

  /**
   * Atualizar role
   */
  async updateRole(roleId: string, roleData: RoleRequest): Promise<void> {
    try {
      await apiClient.put<void>(`/roles/${roleId}`, roleData);
    } catch (error: any) {
      console.error('Erro ao atualizar role:', error);
      throw new Error(error.response?.data?.error_description || 'Erro ao atualizar role');
    }
  }

  /**
   * Atualizar role parcialmente
   */
  async patchRole(roleId: string, roleData: Partial<RoleRequest>): Promise<void> {
    try {
      await apiClient.patch<void>(`/roles/${roleId}`, roleData);
    } catch (error: any) {
      console.error('Erro ao atualizar role:', error);
      throw new Error(error.response?.data?.error_description || 'Erro ao atualizar role');
    }
  }

  /**
   * Deletar role
   */
  async deleteRole(roleId: string): Promise<void> {
    try {
      await apiClient.delete<void>(`/roles/${roleId}`);
    } catch (error: any) {
      console.error('Erro ao deletar role:', error);
      throw new Error(error.response?.data?.error_description || 'Erro ao deletar role');
    }
  }

  /**
   * Atribuir role a usuário
   */
  async assignRoleToUser(userId: string, roleName: string): Promise<void> {
    try {
      await apiClient.post<void>(`/roles/assign/${userId}/${roleName}`);
    } catch (error: any) {
      console.error('Erro ao atribuir role:', error);
      throw new Error(error.response?.data?.error_description || 'Erro ao atribuir role');
    }
  }

  /**
   * Remover role de usuário
   */
  async unassignRoleFromUser(userId: string, roleName: string): Promise<void> {
    try {
      await apiClient.delete<void>(`/roles/unassign/${userId}/${roleName}`);
    } catch (error: any) {
      console.error('Erro ao remover role:', error);
      throw new Error(error.response?.data?.error_description || 'Erro ao remover role');
    }
  }

  /**
   * Validar dados da role
   */
  validateRoleData(roleData: RoleRequest): string[] {
    const errors: string[] = [];

    if (!roleData.name || !roleData.name.trim()) {
      errors.push('Nome da role é obrigatório');
    }

    if (!roleData.description || !roleData.description.trim()) {
      errors.push('Descrição da role é obrigatória');
    }

    // Validar formato do nome (sem espaços, caracteres especiais)
    if (roleData.name && !/^[a-zA-Z0-9_-]+$/.test(roleData.name)) {
      errors.push('Nome da role deve conter apenas letras, números, _ ou -');
    }

    return errors;
  }

  /**
   * Buscar roles ativas
   */
  async getActiveRoles(): Promise<RoleResponse[]> {
    try {
      const roles = await this.getRoles();
      return roles.filter(role => role.enabled);
    } catch (error) {
      console.error('Erro ao buscar roles ativas:', error);
      throw error;
    }
  }

  /**
   * Buscar roles por filtro de texto
   */
  async searchRoles(searchTerm: string): Promise<RoleResponse[]> {
    try {
      const roles = await this.getRoles();
      
      if (!searchTerm.trim()) {
        return roles;
      }

      const term = searchTerm.toLowerCase();
      return roles.filter(role => 
        role.name.toLowerCase().includes(term) ||
        role.description.toLowerCase().includes(term)
      );
    } catch (error) {
      console.error('Erro ao buscar roles:', error);
      throw error;
    }
  }

  /**
   * Verificar se role existe pelo nome
   */
  async roleExists(roleName: string): Promise<boolean> {
    try {
      await this.getRoleById(roleName);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Atualizar apenas a descrição da role
   */
  async updateRoleDescription(roleId: string, description: string): Promise<void> {
    return this.patchRole(roleId, { description });
  }
}

export const roleService = new RoleService();