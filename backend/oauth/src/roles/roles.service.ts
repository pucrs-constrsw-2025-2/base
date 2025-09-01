import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class RolesService {
  private readonly keycloakBase = process.env.KEYCLOAK_INTERNAL_PROTOCOL + '://' + process.env.KEYCLOAK_INTERNAL_HOST + ':' + process.env.KEYCLOAK_INTERNAL_API_PORT;
  private readonly realm = process.env.KEYCLOAK_REALM;

  private authHeaders(accessToken: string) {
    if (!accessToken) throw new HttpException({ error_code: '401', error_description: 'access token required', error_source: 'OAuthAPI' }, HttpStatus.UNAUTHORIZED);
    return { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' };
  }

  async createRole(accessToken: string, role: { name: string; description?: string }) {
    const url = `${this.keycloakBase}/admin/realms/${this.realm}/roles`;
    const resp = await axios.post(url, role, { headers: this.authHeaders(accessToken), validateStatus: () => true });
    if (resp.status === 201) return role;
    throw new HttpException({ error_code: String(resp.status), error_description: resp.data ?? 'error from keycloak', error_source: 'OAuthAPI' }, resp.status);
  }

  async getRoles(accessToken: string) {
    const url = `${this.keycloakBase}/admin/realms/${this.realm}/roles`;
    const resp = await axios.get(url, { headers: this.authHeaders(accessToken) });
    return resp.data;
  }

  async getRoleById(accessToken: string, id: string) {
    const url = `${this.keycloakBase}/admin/realms/${this.realm}/roles-by-id/${id}`;
    const resp = await axios.get(url, { headers: this.authHeaders(accessToken), validateStatus: () => true });
    if (resp.status === 200) return resp.data;
    if (resp.status === 404) throw new HttpException({ error_code: '404', error_description: 'not found', error_source: 'OAuthAPI' }, HttpStatus.NOT_FOUND);
    throw new HttpException({ error_code: String(resp.status), error_description: resp.data ?? 'error from keycloak', error_source: 'OAuthAPI' }, resp.status);
  }

  async updateRole(accessToken: string, id: string, data: any) {
    const url = `${this.keycloakBase}/admin/realms/${this.realm}/roles-by-id/${id}`;
    const resp = await axios.put(url, data, { headers: this.authHeaders(accessToken), validateStatus: () => true });
    if (resp.status === 204) return;
    if (resp.status === 404) throw new HttpException({ error_code: '404', error_description: 'not found', error_source: 'OAuthAPI' }, HttpStatus.NOT_FOUND);
    throw new HttpException({ error_code: String(resp.status), error_description: resp.data ?? 'error from keycloak', error_source: 'OAuthAPI' }, resp.status);
  }

  async deleteRole(accessToken: string, id: string) {
    const url = `${this.keycloakBase}/admin/realms/${this.realm}/roles-by-id/${id}`;
    const resp = await axios.delete(url, { headers: this.authHeaders(accessToken), validateStatus: () => true });
    if (resp.status === 204) return;
    if (resp.status === 404) throw new HttpException({ error_code: '404', error_description: 'not found', error_source: 'OAuthAPI' }, HttpStatus.NOT_FOUND);
    throw new HttpException({ error_code: String(resp.status), error_description: resp.data ?? 'error from keycloak', error_source: 'OAuthAPI' }, resp.status);
  }

  async addRoleToUser(accessToken: string, userId: string, roleName: string) {
    const roleUrl = `${this.keycloakBase}/admin/realms/${this.realm}/roles/${roleName}`;
    const roleResp = await axios.get(roleUrl, { headers: this.authHeaders(accessToken) });
    const role = roleResp.data;
    const url = `${this.keycloakBase}/admin/realms/${this.realm}/users/${userId}/role-mappings/realm`;
    const resp = await axios.post(url, [role], { headers: this.authHeaders(accessToken), validateStatus: () => true });
    if (resp.status === 204) return;
    throw new HttpException({ error_code: String(resp.status), error_description: resp.data ?? 'error from keycloak', error_source: 'OAuthAPI' }, resp.status);
  }

  async removeRoleFromUser(accessToken: string, userId: string, roleName: string) {
    const roleUrl = `${this.keycloakBase}/admin/realms/${this.realm}/roles/${roleName}`;
    const roleResp = await axios.get(roleUrl, { headers: this.authHeaders(accessToken) });
    const role = roleResp.data;
    const url = `${this.keycloakBase}/admin/realms/${this.realm}/users/${userId}/role-mappings/realm`;
    const resp = await axios.delete(url, { headers: this.authHeaders(accessToken), data: [role], validateStatus: () => true });
    if (resp.status === 204) return;
    throw new HttpException({ error_code: String(resp.status), error_description: resp.data ?? 'error from keycloak', error_source: 'OAuthAPI' }, resp.status);
  }
}
