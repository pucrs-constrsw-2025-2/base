import { Injectable, HttpStatus } from '@nestjs/common';
import { CustomHttpException } from '../common/errors/custom-httpexception';
import axios from 'axios';
import * as qs from 'querystring';

@Injectable()
export class UsersService {
  private readonly keycloakBase = process.env.KEYCLOAK_INTERNAL_PROTOCOL + '://' + process.env.KEYCLOAK_INTERNAL_HOST + ':' + process.env.KEYCLOAK_INTERNAL_API_PORT;
  private readonly realm = process.env.KEYCLOAK_REALM;
  private readonly clientId = process.env.KEYCLOAK_CLIENT_ID;
  private readonly clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;
  private readonly grantType = process.env.KEYCLOAK_GRANT_TYPE ?? 'password';

  async login(username: string, password: string) {
    if (!username || !password) {
      throw new CustomHttpException(
        'OA-400',
        'Username and password are required',
        'OAuthAPI',
        HttpStatus.BAD_REQUEST
      );
    }

    const tokenUrl = `${this.keycloakBase}/realms/${this.realm}/protocol/openid-connect/token`;
    const body = qs.stringify({ 
      username, 
      password, 
      client_id: this.clientId, 
      client_secret: this.clientSecret, 
      grant_type: this.grantType 
    });

    try {
      const resp = await axios.post(tokenUrl, body, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      if (resp.status === 200) return resp.data;
      
      throw new CustomHttpException(
        `OA-${resp.status}`,
        resp.data?.error_description ?? 'Authentication failed',
        'KeycloakAPI',
        resp.status,
        [resp.data]
      );
    } catch (err: any) {
      if (err.response) {
        const status = err.response.status;
        if (status === 401) {
          throw new CustomHttpException(
            'OA-401',
            err.response.data?.error_description ?? 'Invalid credentials',
            'KeycloakAPI',
            HttpStatus.UNAUTHORIZED,
            [err.response.data]
          );
        }

        throw new CustomHttpException(
          `OA-${status}`,
          err.response.data?.error_description ?? 'Keycloak authentication error',
          'KeycloakAPI',
          status,
          [err.response.data]
        );
      }

      throw new CustomHttpException(
        'OA-500',
        'Internal server error during authentication',
        'OAuthAPI',
        HttpStatus.INTERNAL_SERVER_ERROR,
        [{ message: err.message }]
      );
    }
  }

  private authHeaders(accessToken: string) {
    if (!accessToken) {
      throw new CustomHttpException(
        'OA-401',
        'Access token required',
        'OAuthAPI',
        HttpStatus.UNAUTHORIZED
      );
    }
    return { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' };
  }

  async createUser(accessToken: string, user: { username: string; password: string; firstName?: string; lastName?: string }) {
    if (!user?.username || !user?.password) {
      throw new CustomHttpException(
        'OA-400',
        'username and password are required',
        'OAuthAPI',
        HttpStatus.BAD_REQUEST
      );
    }
    // basic email validation (lightweight). The full RFC regex is large; can be added later.
    const emailRegex = /.+@.+\..+/;
    if (!emailRegex.test(user.username)) {
      throw new CustomHttpException(
        'OA-400',
        'invalid email',
        'OAuthAPI',
        HttpStatus.BAD_REQUEST
      );
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
      const status = resp.status ?? 500;
      throw new CustomHttpException(
        String(status),
        resp.data ?? 'error from keycloak',
        'OAuthAPI',
        status,
        [resp.data]
      );
    } catch (err: any) {
      if (err.response) {
        const status = err.response.status ?? 500;
        throw new CustomHttpException(
          String(status),
          err.response.data?.errorMessage ?? err.response.data ?? err.message,
          'OAuthAPI',
          status,
          [err.response.data]
        );
      }
      throw new CustomHttpException(
        '500',
        err.message,
        'OAuthAPI',
        HttpStatus.INTERNAL_SERVER_ERROR,
        [{ error_code: '500', error_description: err.message, error_source: 'OAuthAPI' }]
      );
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
        const status = err.response.status ?? 500;
        throw new CustomHttpException(
          String(status),
          err.response.data?.errorMessage ?? err.response.data ?? err.message,
          'OAuthAPI',
          status,
          [err.response.data]
        );
      }
      throw new CustomHttpException(
        '500',
        err.message,
        'OAuthAPI',
        HttpStatus.INTERNAL_SERVER_ERROR,
        [{ error_code: '500', error_description: err.message, error_source: 'OAuthAPI' }]
      );
    }
  }

  async getUserById(accessToken: string, id: string) {
    try {
      const url = `${this.keycloakBase}/admin/realms/${this.realm}/users/${id}`;
      const resp = await axios.get(url, { 
        headers: this.authHeaders(accessToken), 
        validateStatus: () => true 
      });

      if (resp.status === 200) {
        return {
          id: resp.data.id,
          username: resp.data.username,
          firstName: resp.data.firstName,
          lastName: resp.data.lastName,
          enabled: resp.data.enabled
        };
      }

      if (resp.status === 404) {
        throw new CustomHttpException(
          'OA-404',
          'User not found',
          'KeycloakAPI',
          HttpStatus.NOT_FOUND,
          [resp.data]
        );
      }

      throw new CustomHttpException(
        `OA-${resp.status}`,
        resp.data?.errorMessage ?? 'Keycloak error',
        'KeycloakAPI',
        resp.status,
        [resp.data]
      );
    } catch (err: any) {
      if (err.response) {
        const status = err.response.status;
        throw new CustomHttpException(
          `OA-${status}`,
          err.response.data?.errorMessage ?? 'Error accessing Keycloak',
          'KeycloakAPI',
          status,
          [err.response.data]
        );
      }

      throw new CustomHttpException(
        'OA-500',
        'Internal server error',
        'OAuthAPI',
        HttpStatus.INTERNAL_SERVER_ERROR,
        [{ message: err.message }]
      );
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
      if (resp.status === 404) throw new CustomHttpException(
        'OA-404',
        'not found',
        'OAuthAPI',
        HttpStatus.NOT_FOUND,
        [{ error_code: '404', error_description: 'not found', error_source: 'OAuthAPI' }]
      );
      throw new CustomHttpException(
        String(resp.status),
        resp.data ?? 'error from keycloak',
        'OAuthAPI',
        resp.status,
        [resp.data]
      );
    } catch (err: any) {
      if (err.response) {
        const status = err.response.status ?? 500;
        throw new CustomHttpException(
          String(status),
          err.response.data ?? err.message,
          'OAuthAPI',
          status,
          [err.response.data]
        );
      }
      throw new CustomHttpException(
        '500',
        err.message,
        'OAuthAPI',
        HttpStatus.INTERNAL_SERVER_ERROR,
        [{ error_code: '500', error_description: err.message, error_source: 'OAuthAPI' }]
      );
    }
  }

  async patchPassword(accessToken: string, id: string, password: string) {
    console.debug('[UsersService] patchPassword', { id });
    try {
      const url = `${this.keycloakBase}/admin/realms/${this.realm}/users/${id}/reset-password`;
      const body = { type: 'password', value: password, temporary: false };
      const resp = await axios.put(url, body, { headers: this.authHeaders(accessToken), validateStatus: () => true });
      if (resp.status === 204) return;
      if (resp.status === 404) throw new CustomHttpException(
        'OA-404',
        'not found',
        'OAuthAPI',
        HttpStatus.NOT_FOUND,
        [{ error_code: '404', error_description: 'not found', error_source: 'OAuthAPI' }]
      );
      throw new CustomHttpException(
        String(resp.status),
        resp.data ?? 'error from keycloak',
        'OAuthAPI',
        resp.status,
        [resp.data]
      );
    } catch (err: any) {
      if (err.response) {
        const status = err.response.status ?? 500;
        throw new CustomHttpException(
          String(status),
          err.response.data ?? err.message,
          'OAuthAPI',
          status,
          [err.response.data]
        );
      }
      throw new CustomHttpException(
        '500',
        err.message,
        'OAuthAPI',
        HttpStatus.INTERNAL_SERVER_ERROR,
        [{ error_code: '500', error_description: err.message, error_source: 'OAuthAPI' }]
      );
    }
  }

  async disableUser(accessToken: string, id: string) {
    console.debug('[UsersService] disableUser', { id });
    try {
      const url = `${this.keycloakBase}/admin/realms/${this.realm}/users/${id}`;
      const payload = { enabled: false };
      const resp = await axios.put(url, payload, { headers: this.authHeaders(accessToken), validateStatus: () => true });
      if (resp.status === 204) return;
      if (resp.status === 404) throw new CustomHttpException(
        'OA-404',
        'not found',
        'OAuthAPI',
        HttpStatus.NOT_FOUND,
        [{ error_code: '404', error_description: 'not found', error_source: 'OAuthAPI' }]
      );
      throw new CustomHttpException(
        String(resp.status),
        resp.data ?? 'error from keycloak',
        'OAuthAPI',
        resp.status,
        [resp.data]
      );
    } catch (err: any) {
      if (err.response) {
        const status = err.response.status ?? 500;
        throw new CustomHttpException(
          String(status),
          err.response.data ?? err.message,
          'OAuthAPI',
          status,
          [err.response.data]
        );
      }
      throw new CustomHttpException(
        '500',
        err.message,
        'OAuthAPI',
        HttpStatus.INTERNAL_SERVER_ERROR,
        [{ error_code: '500', error_description: err.message, error_source: 'OAuthAPI' }]
      );
    }
  }
}
