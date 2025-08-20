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
import { IKeycloakAdapter } from './keycloak.adapter.interface';

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
      'keycloak.internal.protocol',
    );
    const host = this.configService.get<string>('keycloak.internal.host');
    const port = this.configService.get<string>('keycloak.internal.apiPort');

    // Debug: Log das variáveis de ambiente
    this.logger.debug(`keycloak.internal.protocol: ${protocol}`);
    this.logger.debug(`keycloak.internal.host: ${host}`);
    this.logger.debug(`keycloak.internal.apiPort: ${port}`);

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
    const realm = this.configService.get<string>('keycloak.realm');
    if (!realm) {
      this.logger.error('Keycloak realm is not configured.');
      throw new InternalServerErrorException(
        'Keycloak realm is not configured.',
      );
    }
    return realm;
  }

  async login(loginDto: LoginDto): Promise<KeycloakTokenResponse> {
    this.logger.log(`Attempting to log in user: ${loginDto.username}`);
    const realm = this.getRealm();
    const url = this.getUrl(`/realms/${realm}/protocol/openid-connect/token`);
    this.logger.log(`Login URL: ${url}`);

    const body = new URLSearchParams();
    body.append(
      'client_id',
      this.configService.get<string>('keycloak.clientId')!,
    );
    body.append(
      'client_secret',
      this.configService.get<string>('keycloak.clientSecret')!,
    );
    body.append(
      'grant_type',
      this.configService.get<string>('keycloak.grantType')!,
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

    const { password, ...user } = createUserDto;
    const userPayload = {
      ...user,
      enabled: true,
      credentials: [
        {
          type: 'password',
          value: password,
          temporary: false,
        },
      ],
    };

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

    try {
      await firstValueFrom(
        this.httpService.put(url, updateUserDto, {
          headers: { Authorization: `Bearer ${adminToken}` },
        }),
      );
      this.logger.log(`User updated successfully by ID: ${id}`);
    } catch (error) {
      const axiosError = error as AxiosError;
      this.logger.error(
        `Keycloak API error on updateUser: ${axiosError.message}`,
        axiosError.stack,
      );
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
    const realm = this.getRealm();
    const url = this.getUrl(`/realms/${realm}/protocol/openid-connect/token`);

    const body = new URLSearchParams();
    body.append(
      'client_id',
      this.configService.get<string>('KEYCLOAK_CLIENT_ID')!,
    );
    body.append(
      'client_secret',
      this.configService.get<string>('KEYCLOAK_CLIENT_SECRET')!,
    );
    body.append('grant_type', 'client_credentials');

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
}
