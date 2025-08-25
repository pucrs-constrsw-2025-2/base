import { HttpService } from '@nestjs/axios';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { LoginDto } from 'src/auth/dto/login.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { UserDto } from 'src/users/dto/user.dto';
import { CreateRoleDto } from 'src/roles/dto/create-role.dto';
import { UpdateRoleDto } from 'src/roles/dto/update-role.dto';
import { RoleDto } from 'src/roles/dto/role.dto';
import { IKeycloakAdapter } from './keycloak.adapter.interface';
import { UpdatePasswordDto } from 'src/users/dto/update-password.dto';

interface KeycloakTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_expires_in: number;
  refresh_token: string;
  token_type: string;
  'not-before-policy': number;
  session_state: string;
  scope: string;
}

@Injectable()
export class KeycloakAdapter implements IKeycloakAdapter {
  private readonly logger = new Logger(KeycloakAdapter.name);
  private adminToken: string | null = null;
  private tokenExpirationTime: number | null = null;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private getUrl(path: string): string {
    const protocol = this.configService.get<string>(
      'KEYCLOAK_INTERNAL_PROTOCOL',
    );
    const host = this.configService.get<string>('KEYCLOAK_INTERNAL_HOST');
    const port = this.configService.get<string>('KEYCLOAK_INTERNAL_API_PORT');

    // Debug: Log das variáveis de ambiente
    this.logger.debug(`KEYCLOAK_INTERNAL_PROTOCOL: ${protocol}`);
    this.logger.debug(`KEYCLOAK_INTERNAL_HOST: ${host}`);
    this.logger.debug(`KEYCLOAK_INTERNAL_API_PORT: ${port}`);

    if (!protocol || !host || !port) {
      this.logger.error(
        'Keycloak connection configuration is missing or invalid.',
      );
      this.logger.error(`Protocol: ${protocol}, Host: ${host}, Port: ${port}`);
      throw new InternalServerErrorException(
        'Keycloak connection configuration is missing or invalid.',
      );
    }

    return `${protocol}://${host}:${port}${path}`;
  }

  private getRealm(): string {
    const realm = this.configService.get<string>('KEYCLOAK_REALM');
    if (!realm) {
      this.logger.error('Keycloak realm is not configured.');
      throw new InternalServerErrorException(
        'Keycloak realm is not configured.',
      );
    }
    return realm;
  }

  private getClientId(): string {
    const clientId = this.configService.get<string>('KEYCLOAK_CLIENT_ID');
    if (!clientId) {
      this.logger.error('Keycloak client ID is not configured.');
      throw new InternalServerErrorException(
        'Keycloak client ID is not configured.',
      );
    }
    return clientId;
  }

  async login(loginDto: LoginDto): Promise<KeycloakTokenResponse> {
    this.logger.log(`Attempting to log in user: ${loginDto.username}`);
    const realm = this.getRealm();
    const url = this.getUrl(`/realms/${realm}/protocol/openid-connect/token`);
    this.logger.log(`Login URL: ${url}`);

    const body = new URLSearchParams();
    body.append(
      'client_id',
      this.configService.get<string>('KEYCLOAK_CLIENT_ID')!,
    );
    body.append(
      'client_secret',
      this.configService.get<string>('KEYCLOAK_CLIENT_SECRET')!,
    );
    body.append(
      'grant_type',
      this.configService.get<string>('KEYCLOAK_GRANT_TYPE')!,
    );
    body.append('username', loginDto.username);
    body.append('password', loginDto.password);

    try {
      const { data } = await firstValueFrom(
        this.httpService.post<KeycloakTokenResponse>(url, body, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }),
      );
      this.logger.log(`Login successful for user: ${loginDto.username}`);
      return data;
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error(
        `Keycloak API error on login for user ${loginDto.username}: ${axiosError.message}`,
        axiosError.stack,
      );
      if (axiosError.response?.status === 401) {
        throw new UnauthorizedException('Invalid credentials');
      }
      throw new InternalServerErrorException(
        'Error during authentication',
        axiosError.message,
      );
    }
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserDto> {
    this.logger.log(`Attempting to create user: ${createUserDto.username}`);
    const adminToken = await this.getAdminToken();
    const realm = this.getRealm();
    const url = this.getUrl(`/admin/realms/${realm}/users`);
    this.logger.debug(`URL: ${url}`);

    const { password, username, email, firstName, lastName } = createUserDto;
    const userPayload = {
      username,
      email,
      firstName,
      lastName,
      enabled: true,
      credentials: [
        {
          type: 'password',
          value: password,
          temporary: false,
        },
      ],
    };

    this.logger.debug(`User payload: ${JSON.stringify(userPayload, null, 2)}`);
    this.logger.debug(`Admin token present: ${!!adminToken}`);

    try {
      const { headers } = await firstValueFrom(
        this.httpService.post<void>(url, userPayload, {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
        }),
      );
      this.logger.log(`User created successfully: ${createUserDto.username}`);
      const locationHeader = headers['location'] as string;
      const userId = locationHeader.split('/').pop()!;
      const newUser = await this.findUserById(userId);
      return newUser;
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error(
        `Keycloak API error on createUser: ${axiosError.message}`,
        axiosError.stack,
      );
      if (axiosError.response?.status === 409) {
        throw new ConflictException('User already exists');
      }
      throw new InternalServerErrorException(
        'Error creating user',
        axiosError.message,
      );
    }
  }

  async findAllUsers(): Promise<UserDto[]> {
    this.logger.log('Attempting to fetch all users');
    const adminToken = await this.getAdminToken();
    const realm = this.getRealm();
    const url = this.getUrl(`/admin/realms/${realm}/users`);

    try {
      const { data } = await firstValueFrom(
        this.httpService.get<UserDto[]>(url, {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
      );
      this.logger.log('Users fetched successfully');
      return data;
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error(
        `Keycloak API error on findAllUsers: ${axiosError.message}`,
        axiosError.stack,
      );
      throw new InternalServerErrorException(
        'Failed to fetch users',
        axiosError.message,
      );
    }
  }

  async findUserById(id: string): Promise<UserDto> {
    this.logger.log(`Attempting to fetch user by ID: ${id}`);
    const adminToken = await this.getAdminToken();
    const realm = this.getRealm();
    const url = this.getUrl(`/admin/realms/${realm}/users/${id}`);

    try {
      const { data } = await firstValueFrom(
        this.httpService.get<UserDto>(url, {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
      );
      this.logger.log(`User fetched successfully by ID: ${id}`);
      return data;
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error(
        `Keycloak API error on findUserById: ${axiosError.message}`,
        axiosError.stack,
      );
      if (axiosError.response?.status === 404) {
        throw new NotFoundException(`User with ID "${id}" not found`);
      }
      throw new InternalServerErrorException(
        'Failed to fetch user',
        axiosError.message,
      );
    }
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<void> {
    this.logger.log(`Attempting to update user by ID: ${id}`);
    const adminToken = await this.getAdminToken();
    const realm = this.getRealm();
    const url = this.getUrl(`/admin/realms/${realm}/users/${id}`);

    // First, get the current user state
    const currentUser = await this.findUserById(id);

    // Merge the changes
    const updatedUser = {
      ...currentUser,
      ...updateUserDto,
    };

    try {
      await firstValueFrom(
        this.httpService.put(url, updatedUser, {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
        }),
      );
      this.logger.log(`User updated successfully by ID: ${id}`);
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error(
        `Keycloak API error on updateUser: ${axiosError.message}`,
        axiosError.stack,
      );
      if (axiosError.response) {
        this.logger.error(
          `Keycloak response data: ${JSON.stringify(axiosError.response.data)}`,
        );
      }
      if (axiosError.response?.status === 404) {
        throw new NotFoundException(`User with ID "${id}" not found`);
      }
      throw new InternalServerErrorException(
        'Failed to update user',
        axiosError.message,
      );
    }
  }

  async deleteUser(id: string): Promise<void> {
    this.logger.log(`Attempting to delete user by ID: ${id}`);
    const adminToken = await this.getAdminToken();
    const realm = this.getRealm();
    const url = this.getUrl(`/admin/realms/${realm}/users/${id}`);

    try {
      await firstValueFrom(
        this.httpService.delete(url, {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
      );
      this.logger.log(`User deleted successfully by ID: ${id}`);
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error(
        `Keycloak API error on deleteUser: ${axiosError.message}`,
        axiosError.stack,
      );
      if (axiosError.response?.status === 404) {
        throw new NotFoundException(`User with ID "${id}" not found`);
      }
      throw new InternalServerErrorException(
        'Failed to delete user',
        axiosError.message,
      );
    }
  }

  async updatePassword(
    id: string,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<void> {
    this.logger.log(`Attempting to update password for user by ID: ${id}`);
    const adminToken = await this.getAdminToken();
    const realm = this.getRealm();
    const url = this.getUrl(
      `/admin/realms/${realm}/users/${id}/reset-password`,
    );

    const passwordCredential = {
      type: 'password',
      value: updatePasswordDto.password,
      temporary: false,
    };

    try {
      await firstValueFrom(
        this.httpService.put(url, passwordCredential, {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
        }),
      );
      this.logger.log(`Password updated successfully for user by ID: ${id}`);
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error(
        `Keycloak API error on updatePassword: ${axiosError.message}`,
        axiosError.stack,
      );
      if (axiosError.response?.status === 404) {
        throw new NotFoundException(`User with ID "${id}" not found`);
      }
      throw new InternalServerErrorException(
        'Failed to update password',
        axiosError.message,
      );
    }
  }

  async validateToken(token: string): Promise<boolean> {
    this.logger.log('Attempting to validate token');
    const realm = this.getRealm();
    const url = this.getUrl(
      `/realms/${realm}/protocol/openid-connect/token/introspect`,
    );

    const clientId = this.configService.get<string>('KEYCLOAK_CLIENT_ID');
    const clientSecret = this.configService.get<string>(
      'KEYCLOAK_CLIENT_SECRET',
    );

    if (!clientId || !clientSecret) {
      this.logger.error('Keycloak client ID or secret not configured');
      throw new InternalServerErrorException(
        'Keycloak client ID or secret not configured',
      );
    }

    const params = new URLSearchParams();
    params.append('token', token);
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);

    try {
      const { data } = await firstValueFrom(
        this.httpService.post<{ active: boolean }>(url, params, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }),
      );
      this.logger.log(`Token validation result: ${data.active}`);
      return data.active;
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error(
        `Keycloak API error on validateToken: ${axiosError.message}`,
        axiosError.stack,
      );
      return false;
    }
  }

  private async getAdminToken(): Promise<string> {
    if (
      this.adminToken &&
      this.tokenExpirationTime &&
      Date.now() < this.tokenExpirationTime
    ) {
      this.logger.log('Using cached admin token');
      return this.adminToken;
    }

    this.logger.log('Fetching new admin token');
    // Use master realm for admin operations
    const url = this.getUrl(`/realms/master/protocol/openid-connect/token`);

    // For master realm admin operations, use admin-cli client
    const clientId = 'admin-cli';
    const clientSecret = this.configService.get<string>(
      'KEYCLOAK_CLIENT_SECRET',
    )!;
    const adminUsername = this.configService.get<string>(
      'KEYCLOAK_ADMIN_USERNAME',
    )!;
    const adminPassword = this.configService.get<string>(
      'KEYCLOAK_ADMIN_PASSWORD',
    )!;

    this.logger.debug(`Admin token request - URL: ${url}`);
    this.logger.debug(`Admin token request - Client ID: ${clientId}`);
    this.logger.debug(`Admin token request - Username: ${adminUsername}`);
    this.logger.debug(
      `Admin token request - Client Secret present: ${!!clientSecret}`,
    );
    this.logger.debug(
      `Admin token request - Password present: ${!!adminPassword}`,
    );

    const body = new URLSearchParams();
    body.append('client_id', clientId);
    body.append('grant_type', 'password');
    body.append('username', adminUsername);
    body.append('password', adminPassword);

    try {
      const { data } = await firstValueFrom(
        this.httpService.post<KeycloakTokenResponse>(url, body, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }),
      );
      this.adminToken = data.access_token;
      this.tokenExpirationTime = Date.now() + (data.expires_in - 60) * 1000; // 60s buffer
      this.logger.log('New admin token fetched and cached');
      return this.adminToken;
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error(
        `Failed to obtain admin token: ${axiosError.message}`,
        axiosError.stack,
      );
      throw new InternalServerErrorException(
        'Failed to obtain admin token',
        axiosError.message,
      );
    }
  }

  async createRole(createRoleDto: CreateRoleDto): Promise<RoleDto> {
    this.logger.log(`Attempting to create role: ${createRoleDto.name}`);
    const adminToken = await this.getAdminToken();
    const realm = this.getRealm();
    const clientId = this.getClientId();
    const url = this.getUrl(`/admin/realms/${realm}/roles`);
    this.logger.debug(`URL: ${url}`);

    const rolePayload = {
      name: createRoleDto.name,
      description: createRoleDto.description || '',
      composite: createRoleDto.composite || false,
      clientRole: true,
      containerId: clientId,
    };

    this.logger.debug(`Role payload: ${JSON.stringify(rolePayload, null, 2)}`);

    try {
      await firstValueFrom(
        this.httpService.post<void>(url, rolePayload, {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
        }),
      );
      this.logger.log(`Role created successfully: ${createRoleDto.name}`);
      const newRole = await this.findRoleByName(createRoleDto.name);
      return newRole;
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error(
        `Keycloak API error on createRole: ${axiosError.message}`,
        axiosError.stack,
      );
      if (axiosError.response?.status === 409) {
        throw new ConflictException('Role already exists');
      }
      throw new InternalServerErrorException(
        'Error creating role',
        axiosError.message,
      );
    }
  }

  async findAllRoles(): Promise<RoleDto[]> {
    this.logger.log('Attempting to fetch all roles');
    const adminToken = await this.getAdminToken();
    const realm = this.getRealm();
    // const clientId = this.getClientId();
    const url = this.getUrl(`/admin/realms/${realm}/roles`);

    try {
      const { data } = await firstValueFrom(
        this.httpService.get<RoleDto[]>(url, {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
      );
      this.logger.log('Roles fetched successfully');
      return data;
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error(
        `Keycloak API error on findAllRoles: ${axiosError.message}`,
        axiosError.stack,
      );
      throw new InternalServerErrorException(
        'Failed to fetch roles',
        axiosError.message,
      );
    }
  }

  async findRoleByName(name: string): Promise<RoleDto> {
    this.logger.log(`Attempting to fetch role by name: ${name}`);
    const adminToken = await this.getAdminToken();
    const realm = this.getRealm();
    const clientId = this.getClientId();
    const url = this.getUrl(`/admin/realms/${realm}/roles/${name}`);

    try {
      const { data } = await firstValueFrom(
        this.httpService.get<RoleDto>(url, {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
      );
      this.logger.log(`Role fetched successfully by name: ${name}`);
      return data;
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error(
        `Keycloak API error on findRoleByName: ${axiosError.message}`,
        axiosError.stack,
      );
      if (axiosError.response?.status === 404) {
        throw new NotFoundException(`Role with name "${name}" not found`);
      }
      throw new InternalServerErrorException(
        'Failed to fetch role',
        axiosError.message,
      );
    }
  }

  async updateRole(name: string, updateRoleDto: UpdateRoleDto): Promise<void> {
    this.logger.log(`Attempting to update role: ${name}`);
    const adminToken = await this.getAdminToken();
    const realm = this.getRealm();
    const clientId = this.getClientId();
    const url = this.getUrl(
      `/admin/realms/${realm}/clients/${clientId}/roles/${name}`,
    );

    // First, get the current role to preserve existing properties
    const currentRole = await this.findRoleByName(name);

    const rolePayload = {
      id: currentRole.id,
      name: updateRoleDto.name || currentRole.name,
      description: updateRoleDto.description || currentRole.description,
      composite:
        updateRoleDto.composite !== undefined
          ? updateRoleDto.composite
          : currentRole.composite,
      clientRole: true,
      containerId: clientId,
      attributes: currentRole.attributes || {},
    };

    this.logger.debug(
      `Role update payload: ${JSON.stringify(rolePayload, null, 2)}`,
    );

    try {
      await firstValueFrom(
        this.httpService.put(url, rolePayload, {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
      );
      this.logger.log(`Role updated successfully: ${name}`);
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error(
        `Keycloak API error on updateRole: ${axiosError.message}`,
        axiosError.stack,
      );
      if (axiosError.response?.status === 404) {
        throw new NotFoundException(`Role with name "${name}" not found`);
      }
      throw new InternalServerErrorException(
        'Failed to update role',
        axiosError.message,
      );
    }
  }

  async deleteRole(name: string): Promise<void> {
    this.logger.log(`Attempting to delete role: ${name}`);
    const adminToken = await this.getAdminToken();
    const realm = this.getRealm();
    const clientId = this.getClientId();
    const url = this.getUrl(
      `/admin/realms/${realm}/clients/${clientId}/roles/${name}`,
    );

    try {
      await firstValueFrom(
        this.httpService.delete(url, {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
      );
      this.logger.log(`Role deleted successfully: ${name}`);
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error(
        `Keycloak API error on deleteRole: ${axiosError.message}`,
        axiosError.stack,
      );
      if (axiosError.response?.status === 404) {
        throw new NotFoundException(`Role with name "${name}" not found`);
      }
      throw new InternalServerErrorException(
        'Failed to delete role',
        axiosError.message,
      );
    }
  }

  async assignRoleToUser(roleName: string, userId: string): Promise<void> {
    this.logger.log(`Attempting to assign role ${roleName} to user ${userId}`);
    const adminToken = await this.getAdminToken();
    const realm = this.getRealm();
    const url = this.getUrl(
      `/admin/realms/${realm}/users/${userId}/role-mappings/realm`,
    );

    // First, get the role to get its ID
    const role = await this.findRoleByName(roleName);

    const roleMappingPayload = [
      {
        id: role.id,
        name: role.name,
      },
    ];

    this.logger.debug(
      `Role mapping payload: ${JSON.stringify(roleMappingPayload, null, 2)}`,
    );

    try {
      await firstValueFrom(
        this.httpService.post(url, roleMappingPayload, {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
        }),
      );
      this.logger.log(
        `Role ${roleName} assigned successfully to user ${userId}`,
      );
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error(
        `Keycloak API error on assignRoleToUser: ${axiosError.message}`,
        axiosError.stack,
      );
      if (axiosError.response?.status === 404) {
        throw new NotFoundException(
          `User with ID "${userId}" or role "${roleName}" not found`,
        );
      }
      throw new InternalServerErrorException(
        'Failed to assign role to user',
        axiosError.message,
      );
    }
  }

  async removeRoleFromUser(roleName: string, userId: string): Promise<void> {
    this.logger.log(
      `Attempting to remove role ${roleName} from user ${userId}`,
    );
    const adminToken = await this.getAdminToken();
    const realm = this.getRealm();
    const url = this.getUrl(
      `/admin/realms/${realm}/users/${userId}/role-mappings/realm`,
    );

    // First, get the role to get its ID
    const role = await this.findRoleByName(roleName);

    const roleMappingPayload = [
      {
        id: role.id,
        name: role.name,
      },
    ];

    this.logger.debug(
      `Role mapping payload: ${JSON.stringify(roleMappingPayload, null, 2)}`,
    );

    try {
      await firstValueFrom(
        this.httpService.delete(url, {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
          data: roleMappingPayload,
        }),
      );
      this.logger.log(
        `Role ${roleName} removed successfully from user ${userId}`,
      );
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error(
        `Keycloak API error on removeRoleFromUser: ${axiosError.message}`,
        axiosError.stack,
      );
      if (axiosError.response?.status === 404) {
        throw new NotFoundException(
          `User with ID "${userId}" or role "${roleName}" not found`,
        );
      }
      throw new InternalServerErrorException(
        'Failed to remove role from user',
        axiosError.message,
      );
    }
  }
}
