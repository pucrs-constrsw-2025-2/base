import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import * as qs from 'querystring';

@Injectable()
export class UsersService {
  private keycloakBase = process.env.KEYCLOAK_INTERNAL_PROTOCOL + '://' + process.env.KEYCLOAK_INTERNAL_HOST + ':' + process.env.KEYCLOAK_INTERNAL_API_PORT;
  private realm = process.env.KEYCLOAK_REALM;
  private clientId = process.env.KEYCLOAK_CLIENT_ID;
  private clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;
  private grantType = process.env.KEYCLOAK_GRANT_TYPE ?? 'password';

  async login(username: string, password: string) {
    console.debug('[UsersService] login called', { username });
    if (!username || !password) {
      throw new HttpException({ error_code: '400', error_description: 'username and password required', error_source: 'OAuthAPI' }, HttpStatus.BAD_REQUEST);
    }

    const tokenUrl = `${this.keycloakBase}/auth/realms/${this.realm}/protocol/openid-connect/token`;
    console.debug('[UsersService] calling tokenUrl', tokenUrl);
    const body = qs.stringify({ username, password, client_id: this.clientId, client_secret: this.clientSecret, grant_type: this.grantType });

    console.debug(body);
    try {
      const resp = await axios.post(tokenUrl, body, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
      if (resp.status === 200) return resp.data;
      console.debug('[UsersService] login error response', resp);
      throw new HttpException({ error_code: String(resp.status), error_description: 'error from keycloak', error_source: 'OAuthAPI' }, resp.status);
    } catch (err: any) {
        console.debug('[UsersService] login error', err);
      if (err.response) {
        const status = err.response.status || 500;
        throw new HttpException({ error_code: String(status), error_description: err.response.data?.error_description || err.response.data, error_source: 'OAuthAPI' }, status);
      }
      throw new HttpException({ error_code: '500', error_description: err.message, error_source: 'OAuthAPI' }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private authHeaders(accessToken: string) {
    if (!accessToken) throw new HttpException({ error_code: '401', error_description: 'access token required', error_source: 'OAuthAPI' }, HttpStatus.UNAUTHORIZED);
    return { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' };
  }

  async createUser(accessToken: string, user: { username: string; password: string; firstName?: string; lastName?: string }) {
    console.debug('[UsersService] createUser', { username: user.username });
    if (!user?.username || !user?.password) {
      throw new HttpException({ error_code: '400', error_description: 'username and password are required', error_source: 'OAuthAPI' }, HttpStatus.BAD_REQUEST);
    }
    // basic email validation (lightweight). The full RFC regex is large; can be added later.
    const emailRegex = /.+@.+\..+/;
    if (!emailRegex.test(user.username)) {
      throw new HttpException({ error_code: '400', error_description: 'invalid email', error_source: 'OAuthAPI' }, HttpStatus.BAD_REQUEST);
    }

    const url = `${this.keycloakBase}/admin/realms/${this.realm}/users`;
    const payload = {
      username: user.username,
      email: user.username,
      enabled: true,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    try {
      const resp = await axios.post(url, payload, { headers: this.authHeaders(accessToken), validateStatus: () => true });
      if (resp.status === 201) {
        const location = resp.headers['location'] as string;
        const id = location ? location.split('/').pop() : undefined;
        // set password
        if (id) {
          const pwdUrl = `${this.keycloakBase}/admin/realms/${this.realm}/users/${id}/reset-password`;
          const pwdBody = { type: 'password', value: user.password, temporary: false };
          await axios.put(pwdUrl, pwdBody, { headers: this.authHeaders(accessToken) });
        }
        return {
          id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          enabled: true,
        };
      }

      // forward Keycloak error
      const status = resp.status || 500;
      throw new HttpException({ error_code: String(status), error_description: resp.data || 'error from keycloak', error_source: 'OAuthAPI' }, status);
    } catch (err: any) {
      if (err.response) {
        const status = err.response.status || 500;
        throw new HttpException({ error_code: String(status), error_description: err.response.data?.errorMessage || err.response.data || err.message, error_source: 'OAuthAPI' }, status);
      }
      throw new HttpException({ error_code: '500', error_description: err.message, error_source: 'OAuthAPI' }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getUsers(accessToken: string, enabled?: string) {
    console.debug('[UsersService] getUsers called', { enabled });
    try {
      const url = `${this.keycloakBase}/admin/realms/${this.realm}/users` + (enabled !== undefined ? `?enabled=${enabled}` : '');
      const resp = await axios.get(url, { headers: this.authHeaders(accessToken) });
      // map to required shape
      return resp.data.map((u: any) => ({ id: u.id, username: u.username, firstName: u.firstName, lastName: u.lastName, enabled: u.enabled }));
    } catch (err: any) {
      if (err.response) {
        const status = err.response.status || 500;
        throw new HttpException({ error_code: String(status), error_description: err.response.data || err.message, error_source: 'OAuthAPI' }, status);
      }
      throw new HttpException({ error_code: '500', error_description: err.message, error_source: 'OAuthAPI' }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getUserById(accessToken: string, id: string) {
    console.debug('[UsersService] getUserById', { id });
    try {
      const url = `${this.keycloakBase}/admin/realms/${this.realm}/users/${id}`;
      const resp = await axios.get(url, { headers: this.authHeaders(accessToken), validateStatus: () => true });
      if (resp.status === 200) return { id: resp.data.id, username: resp.data.username, firstName: resp.data.firstName, lastName: resp.data.lastName, enabled: resp.data.enabled };
      if (resp.status === 404) throw new HttpException({ error_code: '404', error_description: 'not found', error_source: 'OAuthAPI' }, HttpStatus.NOT_FOUND);
      throw new HttpException({ error_code: String(resp.status), error_description: resp.data || 'error from keycloak', error_source: 'OAuthAPI' }, resp.status);
    } catch (err: any) {
      if (err.response) {
        const status = err.response.status || 500;
        throw new HttpException({ error_code: String(status), error_description: err.response.data || err.message, error_source: 'OAuthAPI' }, status);
      }
      throw new HttpException({ error_code: '500', error_description: err.message, error_source: 'OAuthAPI' }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateUser(accessToken: string, id: string, data: any) {
    console.debug('[UsersService] updateUser', { id });
    try {
      const url = `${this.keycloakBase}/admin/realms/${this.realm}/users/${id}`;
      const payload = {
        username: data.username,
        email: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        enabled: data.enabled,
      };
      const resp = await axios.put(url, payload, { headers: this.authHeaders(accessToken), validateStatus: () => true });
      if (resp.status === 204) return;
      if (resp.status === 404) throw new HttpException({ error_code: '404', error_description: 'not found', error_source: 'OAuthAPI' }, HttpStatus.NOT_FOUND);
      throw new HttpException({ error_code: String(resp.status), error_description: resp.data || 'error from keycloak', error_source: 'OAuthAPI' }, resp.status);
    } catch (err: any) {
      if (err.response) {
        const status = err.response.status || 500;
        throw new HttpException({ error_code: String(status), error_description: err.response.data || err.message, error_source: 'OAuthAPI' }, status);
      }
      throw new HttpException({ error_code: '500', error_description: err.message, error_source: 'OAuthAPI' }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async patchPassword(accessToken: string, id: string, password: string) {
    console.debug('[UsersService] patchPassword', { id });
    try {
      const url = `${this.keycloakBase}/admin/realms/${this.realm}/users/${id}/reset-password`;
      const body = { type: 'password', value: password, temporary: false };
      const resp = await axios.put(url, body, { headers: this.authHeaders(accessToken), validateStatus: () => true });
      if (resp.status === 204) return;
      if (resp.status === 404) throw new HttpException({ error_code: '404', error_description: 'not found', error_source: 'OAuthAPI' }, HttpStatus.NOT_FOUND);
      throw new HttpException({ error_code: String(resp.status), error_description: resp.data || 'error from keycloak', error_source: 'OAuthAPI' }, resp.status);
    } catch (err: any) {
      if (err.response) {
        const status = err.response.status || 500;
        throw new HttpException({ error_code: String(status), error_description: err.response.data || err.message, error_source: 'OAuthAPI' }, status);
      }
      throw new HttpException({ error_code: '500', error_description: err.message, error_source: 'OAuthAPI' }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async disableUser(accessToken: string, id: string) {
    console.debug('[UsersService] disableUser', { id });
    try {
      const url = `${this.keycloakBase}/admin/realms/${this.realm}/users/${id}`;
      const payload = { enabled: false };
      const resp = await axios.put(url, payload, { headers: this.authHeaders(accessToken), validateStatus: () => true });
      if (resp.status === 204) return;
      if (resp.status === 404) throw new HttpException({ error_code: '404', error_description: 'not found', error_source: 'OAuthAPI' }, HttpStatus.NOT_FOUND);
      throw new HttpException({ error_code: String(resp.status), error_description: resp.data || 'error from keycloak', error_source: 'OAuthAPI' }, resp.status);
    } catch (err: any) {
      if (err.response) {
        const status = err.response.status || 500;
        throw new HttpException({ error_code: String(status), error_description: err.response.data || err.message, error_source: 'OAuthAPI' }, status);
      }
      throw new HttpException({ error_code: '500', error_description: err.message, error_source: 'OAuthAPI' }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
