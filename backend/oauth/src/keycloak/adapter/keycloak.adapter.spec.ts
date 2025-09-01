import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { KeycloakAdapter } from './keycloak.adapter';
import { of, throwError } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';
import {
  ConflictException,
  InternalServerErrorException,
  Logger, // 1. Import Logger
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

describe('KeycloakAdapter', () => {
  let adapter: KeycloakAdapter;
  let httpService: HttpService;
  let configService: ConfigService;
  let loggerErrorSpy: jest.SpyInstance; // Variable to hold our spy

  const mockConfigService = {
    get: jest.fn((key: string) => {
      switch (key) {
        case 'KEYCLOAK_INTERNAL_PROTOCOL':
          return 'http';
        case 'KEYCLOAK_INTERNAL_HOST':
          return 'localhost';
        case 'KEYCLOAK_INTERNAL_API_PORT':
          return '8080';
        case 'KEYCLOAK_REALM':
          return 'test-realm';
        case 'KEYCLOAK_CLIENT_ID':
          return 'test-client';
        case 'KEYCLOAK_CLIENT_SECRET':
          return 'test-secret';
        case 'KEYCLOAK_GRANT_TYPE':
          return 'password';
        case 'KEYCLOAK_ADMIN_USERNAME':
          return 'admin';
        case 'KEYCLOAK_ADMIN_PASSWORD':
          return process.env.KEYCLOAK_ADMIN_PASSWORD;
        case 'KEYCLOAK_ADMIN_CLIENT_ID':
          return 'admin-cli';
        default:
          return null;
      }
    }),
  };

  const mockHttpService = {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    // 2. Suppress console.error messages from the logger
    loggerErrorSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => {});

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KeycloakAdapter,
        { provide: HttpService, useValue: mockHttpService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    adapter = module.get<KeycloakAdapter>(KeycloakAdapter);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    // 3. Restore the original logger functionality and clear mocks
    loggerErrorSpy.mockRestore();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(adapter).toBeDefined();
  });

  // ... all of your other describe blocks and tests remain exactly the same ...
  // I've collapsed them for brevity, but you don't need to change them at all.

  describe('private methods', () => {
    it('getUrl should construct url correctly', () => {
      const url = (adapter as any).getUrl('/test');
      expect(url).toEqual('http://localhost:8080/test');
    });

    it('getUrl should throw if config is missing', () => {
      mockConfigService.get.mockReturnValueOnce(null);
      expect(() => (adapter as any).getUrl('/test')).toThrow(
        InternalServerErrorException,
      );
    });

    it('getRealm should return realm', () => {
      const realm = (adapter as any).getRealm();
      expect(realm).toEqual('test-realm');
    });

    it('getRealm should throw if config is missing', () => {
      mockConfigService.get.mockImplementationOnce((key: string) => {
        if (key === 'KEYCLOAK_REALM') return null;
        return 'test';
      });
      expect(() => (adapter as any).getRealm()).toThrow(
        InternalServerErrorException,
      );
    });

    it('getClientId should return client id', () => {
      const clientId = (adapter as any).getClientId();
      expect(clientId).toEqual('test-client');
    });

    it('getClientId should throw if config is missing', () => {
      mockConfigService.get.mockImplementationOnce((key: string) => {
        if (key === 'KEYCLOAK_CLIENT_ID') return null;
        return 'test';
      });
      expect(() => (adapter as any).getClientId()).toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('login', () => {
    it('should return token response on successful login', async () => {
      const loginDto = { username: 'user', password: process.env.TEST_USER_PASSWORD as string };
      const tokenResponse = { access_token: 'token' };
      mockHttpService.post.mockReturnValue(of({ data: tokenResponse }));

      const result = await adapter.login(loginDto);
      expect(result).toEqual(tokenResponse);
      expect(httpService.post).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException on 401 error', async () => {
      const loginDto = { username: 'user', password: process.env.TEST_USER_PASSWORD as string };
      const error = new AxiosError('Unauthorized');
      error.response = { status: 401 } as AxiosResponse;
      mockHttpService.post.mockReturnValue(throwError(() => error));

      await expect(adapter.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw InternalServerErrorException on other errors', async () => {
      const loginDto = { username: 'user', password: process.env.TEST_USER_PASSWORD as string };
      const error = new AxiosError('Some error');
      mockHttpService.post.mockReturnValue(throwError(() => error));

      await expect(adapter.login(loginDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getAdminToken', () => {
    it('should fetch a new admin token if not cached', async () => {
      const tokenResponse = { access_token: 'admin-token', expires_in: 300 };
      mockHttpService.post.mockReturnValue(of({ data: tokenResponse }));

      const token = await (adapter as any).getAdminToken();

      expect(token).toEqual('admin-token');
      expect(httpService.post).toHaveBeenCalledTimes(1);
    });

    it('should return cached token if still valid', async () => {
      const tokenResponse = { access_token: 'admin-token', expires_in: 300 };
      mockHttpService.post.mockReturnValue(of({ data: tokenResponse }));

      await (adapter as any).getAdminToken(); // First call to cache the token
      const token = await (adapter as any).getAdminToken(); // Second call

      expect(token).toEqual('admin-token');
      expect(httpService.post).toHaveBeenCalledTimes(1); // Should only be called once
    });

    it('should fetch a new token if cached token is expired', async () => {
      const expiredTokenResponse = { access_token: 'expired-token', expires_in: 0 };
      mockHttpService.post.mockReturnValueOnce(of({ data: expiredTokenResponse }));
      await (adapter as any).getAdminToken();

      const newTokenResponse = { access_token: 'new-token', expires_in: 300 };
      mockHttpService.post.mockReturnValueOnce(of({ data: newTokenResponse }));
      const token = await (adapter as any).getAdminToken();

      expect(token).toEqual('new-token');
      expect(httpService.post).toHaveBeenCalledTimes(2);
    });

    it('should throw InternalServerErrorException on error', async () => {
      const error = new AxiosError('Some error');
      mockHttpService.post.mockReturnValue(throwError(() => error));

      await expect((adapter as any).getAdminToken()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('createUser', () => {
    const createUserDto = {
      username: 'newuser',
      password: process.env.TEST_USER_PASSWORD as string,
      email: 'newuser@test.com',
      firstName: 'New',
      lastName: 'User',
    };
    const newUserDto = { id: '123', ...createUserDto };

    it('should create a user and return the new user object', async () => {
      jest.spyOn(adapter as any, 'getAdminToken').mockResolvedValue('admin-token');
      mockHttpService.post.mockReturnValue(
        of({ headers: { location: 'users/123' } } as AxiosResponse<void>),
      );
      jest.spyOn(adapter, 'findUserById').mockResolvedValue(newUserDto);

      const result = await adapter.createUser(createUserDto);

      expect(result).toEqual(newUserDto);
      expect(httpService.post).toHaveBeenCalled();
      expect(adapter.findUserById).toHaveBeenCalledWith('123');
    });

    it('should throw ConflictException on 409 error', async () => {
      jest.spyOn(adapter as any, 'getAdminToken').mockResolvedValue('admin-token');
      const error = new AxiosError('Conflict');
      error.response = { status: 409 } as AxiosResponse;
      mockHttpService.post.mockReturnValue(throwError(() => error));

      await expect(adapter.createUser(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw InternalServerErrorException on other errors', async () => {
      jest.spyOn(adapter as any, 'getAdminToken').mockResolvedValue('admin-token');
      const error = new AxiosError('Some error');
      mockHttpService.post.mockReturnValue(throwError(() => error));

      await expect(adapter.createUser(createUserDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAllUsers', () => {
    it('should return an array of users', async () => {
      const users = [{ id: '1' }, { id: '2' }];
      jest.spyOn(adapter as any, 'getAdminToken').mockResolvedValue('admin-token');
      mockHttpService.get.mockReturnValue(of({ data: users }));

      const result = await adapter.findAllUsers();

      expect(result).toEqual(users);
      expect(httpService.get).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on error', async () => {
      jest.spyOn(adapter as any, 'getAdminToken').mockResolvedValue('admin-token');
      const error = new AxiosError('Some error');
      mockHttpService.get.mockReturnValue(throwError(() => error));

      await expect(adapter.findAllUsers()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findUserById', () => {
    it('should return a user object', async () => {
      const user = { id: '1' };
      jest.spyOn(adapter as any, 'getAdminToken').mockResolvedValue('admin-token');
      mockHttpService.get.mockReturnValue(of({ data: user }));

      const result = await adapter.findUserById('1');

      expect(result).toEqual(user);
      expect(httpService.get).toHaveBeenCalled();
    });

    it('should throw NotFoundException on 404 error', async () => {
      jest.spyOn(adapter as any, 'getAdminToken').mockResolvedValue('admin-token');
      const error = new AxiosError('Not Found');
      error.response = { status: 404 } as AxiosResponse;
      mockHttpService.get.mockReturnValue(throwError(() => error));

      await expect(adapter.findUserById('1')).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException on other errors', async () => {
      jest.spyOn(adapter as any, 'getAdminToken').mockResolvedValue('admin-token');
      const error = new AxiosError('Some error');
      mockHttpService.get.mockReturnValue(throwError(() => error));

      await expect(adapter.findUserById('1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const updateUserDto = { firstName: 'Updated' };
      jest.spyOn(adapter as any, 'getAdminToken').mockResolvedValue('admin-token');
      jest.spyOn(adapter, 'findUserById').mockResolvedValue({ id: '1' } as any);
      mockHttpService.put.mockReturnValue(of(null));

      await adapter.updateUser('1', updateUserDto);

      expect(httpService.put).toHaveBeenCalled();
    });

    it('should throw NotFoundException on 404 error', async () => {
      const updateUserDto = { firstName: 'Updated' };
      jest.spyOn(adapter as any, 'getAdminToken').mockResolvedValue('admin-token');
      jest.spyOn(adapter, 'findUserById').mockResolvedValue({ id: '1' } as any);
      const error = new AxiosError('Not Found');
      error.response = { status: 404 } as AxiosResponse;
      mockHttpService.put.mockReturnValue(throwError(() => error));

      await expect(adapter.updateUser('1', updateUserDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException on other errors', async () => {
      const updateUserDto = { firstName: 'Updated' };
      jest.spyOn(adapter as any, 'getAdminToken').mockResolvedValue('admin-token');
      jest.spyOn(adapter, 'findUserById').mockResolvedValue({ id: '1' } as any);
      const error = new AxiosError('Some error');
      mockHttpService.put.mockReturnValue(throwError(() => error));

      await expect(adapter.updateUser('1', updateUserDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      jest.spyOn(adapter as any, 'getAdminToken').mockResolvedValue('admin-token');
      mockHttpService.delete.mockReturnValue(of(null));

      await adapter.deleteUser('1');

      expect(httpService.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException on 404 error', async () => {
      jest.spyOn(adapter as any, 'getAdminToken').mockResolvedValue('admin-token');
      const error = new AxiosError('Not Found');
      error.response = { status: 404 } as AxiosResponse;
      mockHttpService.delete.mockReturnValue(throwError(() => error));

      await expect(adapter.deleteUser('1')).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException on other errors', async () => {
      jest.spyOn(adapter as any, 'getAdminToken').mockResolvedValue('admin-token');
      const error = new AxiosError('Some error');
      mockHttpService.delete.mockReturnValue(throwError(() => error));

      await expect(adapter.deleteUser('1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('updatePassword', () => {
    it('should update a user password', async () => {
      const updatePasswordDto = { password: process.env.TEST_NEW_PASSWORD as string };
      jest.spyOn(adapter as any, 'getAdminToken').mockResolvedValue('admin-token');
      mockHttpService.put.mockReturnValue(of(null));

      await adapter.updatePassword('1', updatePasswordDto);

      expect(httpService.put).toHaveBeenCalled();
    });

    it('should throw NotFoundException on 404 error', async () => {
      const updatePasswordDto = { password: process.env.TEST_NEW_PASSWORD as string };
      jest.spyOn(adapter as any, 'getAdminToken').mockResolvedValue('admin-token');
      const error = new AxiosError('Not Found');
      error.response = { status: 404 } as AxiosResponse;
      mockHttpService.put.mockReturnValue(throwError(() => error));

      await expect(adapter.updatePassword('1', updatePasswordDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException on other errors', async () => {
      const updatePasswordDto = { password: process.env.TEST_NEW_PASSWORD as string };
      jest.spyOn(adapter as any, 'getAdminToken').mockResolvedValue('admin-token');
      const error = new AxiosError('Some error');
      mockHttpService.put.mockReturnValue(throwError(() => error));

      await expect(adapter.updatePassword('1', updatePasswordDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('validateToken', () => {
    it('should return true for a valid token', async () => {
      mockHttpService.post.mockReturnValue(of({ data: { active: true } }));

      const isValid = await adapter.validateToken('valid-token');

      expect(isValid).toBe(true);
    });

    it('should return false for an invalid token', async () => {
      mockHttpService.post.mockReturnValue(of({ data: { active: false } }));

      const isValid = await adapter.validateToken('invalid-token');

      expect(isValid).toBe(false);
    });

    it('should return false on error', async () => {
      const error = new AxiosError('Some error');
      mockHttpService.post.mockReturnValue(throwError(() => error));

      const isValid = await adapter.validateToken('token');

      expect(isValid).toBe(false);
    });

    it('should throw InternalServerErrorException if client secret is missing', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'KEYCLOAK_CLIENT_SECRET') return null;
        return 'test';
      });

      await expect(adapter.validateToken('token')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('createRole', () => {
    const createRoleDto = { name: 'new-role' };
    const newRole = { id: '123', name: 'new-role' };

    it('should create a role', async () => {
      jest.spyOn(adapter as any, 'getAdminToken').mockResolvedValue('admin-token');
      mockHttpService.post.mockReturnValue(of(null));
      jest.spyOn(adapter, 'findRoleByName').mockResolvedValue(newRole as any);

      const result = await adapter.createRole(createRoleDto);

      expect(result).toEqual(newRole);
      expect(httpService.post).toHaveBeenCalled();
    });

    it('should throw ConflictException on 409 error', async () => {
      jest.spyOn(adapter as any, 'getAdminToken').mockResolvedValue('admin-token');
      const error = new AxiosError('Conflict');
      error.response = { status: 409 } as AxiosResponse;
      mockHttpService.post.mockReturnValue(throwError(() => error));

      await expect(adapter.createRole(createRoleDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw InternalServerErrorException on other errors', async () => {
      jest.spyOn(adapter as any, 'getAdminToken').mockResolvedValue('admin-token');
      const error = new AxiosError('Some error');
      mockHttpService.post.mockReturnValue(throwError(() => error));

      await expect(adapter.createRole(createRoleDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findAllRoles', () => {
    it('should return an array of roles', async () => {
      const roles = [{ id: '1' }, { id: '2' }];
      jest.spyOn(adapter as any, 'getAdminToken').mockResolvedValue('admin-token');
      mockHttpService.get.mockReturnValue(of({ data: roles }));

      const result = await adapter.findAllRoles();

      expect(result).toEqual(roles);
      expect(httpService.get).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException on error', async () => {
      jest.spyOn(adapter as any, 'getAdminToken').mockResolvedValue('admin-token');
      const error = new AxiosError('Some error');
      mockHttpService.get.mockReturnValue(throwError(() => error));

      await expect(adapter.findAllRoles()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findRoleByName', () => {
    it('should return a role object', async () => {
      const role = { id: '1', name: 'role' };
      jest.spyOn(adapter as any, 'getAdminToken').mockResolvedValue('admin-token');
      mockHttpService.get.mockReturnValue(of({ data: role }));

      const result = await adapter.findRoleByName('role');

      expect(result).toEqual(role);
      expect(httpService.get).toHaveBeenCalled();
    });

    it('should throw NotFoundException on 404 error', async () => {
      jest.spyOn(adapter as any, 'getAdminToken').mockResolvedValue('admin-token');
      const error = new AxiosError('Not Found');
      error.response = { status: 404 } as AxiosResponse;
      mockHttpService.get.mockReturnValue(throwError(() => error));

      await expect(adapter.findRoleByName('role')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException on other errors', async () => {
      jest.spyOn(adapter as any, 'getAdminToken').mockResolvedValue('admin-token');
      const error = new AxiosError('Some error');
      mockHttpService.get.mockReturnValue(throwError(() => error));

      await expect(adapter.findRoleByName('role')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('updateRole', () => {
    it('should update a role', async () => {
      const updateRoleDto = { name: 'updated-role' };
      jest.spyOn(adapter as any, 'getAdminToken').mockResolvedValue('admin-token');
      jest.spyOn(adapter, 'findRoleByName').mockResolvedValue({ id: '1' } as any);
      mockHttpService.put.mockReturnValue(of(null));

      await adapter.updateRole('role', updateRoleDto);

      expect(httpService.put).toHaveBeenCalled();
    });

    it('should throw NotFoundException on 404 error', async () => {
      const updateRoleDto = { name: 'updated-role' };
      jest.spyOn(adapter as any, 'getAdminToken').mockResolvedValue('admin-token');
      jest.spyOn(adapter, 'findRoleByName').mockResolvedValue({ id: '1' } as any);
      const error = new AxiosError('Not Found');
      error.response = { status: 404 } as AxiosResponse;
      mockHttpService.put.mockReturnValue(throwError(() => error));

      await expect(adapter.updateRole('role', updateRoleDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException on other errors', async () => {
      const updateRoleDto = { name: 'updated-role' };
      jest.spyOn(adapter as any, 'getAdminToken').mockResolvedValue('admin-token');
      jest.spyOn(adapter, 'findRoleByName').mockResolvedValue({ id: '1' } as any);
      const error = new AxiosError('Some error');
      mockHttpService.put.mockReturnValue(throwError(() => error));

      await expect(adapter.updateRole('role', updateRoleDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('deleteRole', () => {
    it('should delete a role', async () => {
      jest.spyOn(adapter as any, 'getAdminToken').mockResolvedValue('admin-token');
      mockHttpService.delete.mockReturnValue(of(null));

      await adapter.deleteRole('role');

      expect(httpService.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException on 404 error', async () => {
      jest.spyOn(adapter as any, 'getAdminToken').mockResolvedValue('admin-token');
      const error = new AxiosError('Not Found');
      error.response = { status: 404 } as AxiosResponse;
      mockHttpService.delete.mockReturnValue(throwError(() => error));

      await expect(adapter.deleteRole('role')).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException on other errors', async () => {
      jest.spyOn(adapter as any, 'getAdminToken').mockResolvedValue('admin-token');
      const error = new AxiosError('Some error');
      mockHttpService.delete.mockReturnValue(throwError(() => error));

      await expect(adapter.deleteRole('role')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('assignRoleToUser', () => {
    it('should assign a role to a user', async () => {
      jest.spyOn(adapter as any, 'getAdminToken').mockResolvedValue('admin-token');
      jest.spyOn(adapter, 'findRoleByName').mockResolvedValue({ id: '1', name: 'role' } as any);
      mockHttpService.post.mockReturnValue(of(null));

      const result = await adapter.assignRoleToUser('role', '1');

      expect(result).toEqual({ message: 'Role assigned to user successfully' });
      expect(httpService.post).toHaveBeenCalled();
    });

    it('should throw NotFoundException on 404 error', async () => {
      jest.spyOn(adapter as any, 'getAdminToken').mockResolvedValue('admin-token');
      jest.spyOn(adapter, 'findRoleByName').mockResolvedValue({ id: '1', name: 'role' } as any);
      const error = new AxiosError('Not Found');
      error.response = { status: 404 } as AxiosResponse;
      mockHttpService.post.mockReturnValue(throwError(() => error));

      await expect(adapter.assignRoleToUser('role', '1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException on other errors', async () => {
      jest.spyOn(adapter as any, 'getAdminToken').mockResolvedValue('admin-token');
      jest.spyOn(adapter, 'findRoleByName').mockResolvedValue({ id: '1', name: 'role' } as any);
      const error = new AxiosError('Some error');
      mockHttpService.post.mockReturnValue(throwError(() => error));

      await expect(adapter.assignRoleToUser('role', '1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('removeRoleFromUser', () => {
    it('should remove a role from a user', async () => {
      jest.spyOn(adapter as any, 'getAdminToken').mockResolvedValue('admin-token');
      jest.spyOn(adapter, 'findRoleByName').mockResolvedValue({ id: '1', name: 'role' } as any);
      mockHttpService.delete.mockReturnValue(of(null));

      const result = await adapter.removeRoleFromUser('role', '1');

      expect(result).toEqual({ message: 'Role removed from user successfully' });
      expect(httpService.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException on 404 error', async () => {
      jest.spyOn(adapter as any, 'getAdminToken').mockResolvedValue('admin-token');
      jest.spyOn(adapter, 'findRoleByName').mockResolvedValue({ id: '1', name: 'role' } as any);
      const error = new AxiosError('Not Found');
      error.response = { status: 404 } as AxiosResponse;
      mockHttpService.delete.mockReturnValue(throwError(() => error));

      await expect(adapter.removeRoleFromUser('role', '1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException on other errors', async () => {
      jest.spyOn(adapter as any, 'getAdminToken').mockResolvedValue('admin-token');
      jest.spyOn(adapter, 'findRoleByName').mockResolvedValue({ id: '1', name: 'role' } as any);
      const error = new AxiosError('Some error');
      mockHttpService.delete.mockReturnValue(throwError(() => error));

      await expect(adapter.removeRoleFromUser('role', '1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findRolesByUserId', () => {
    it('should return an array of roles for a user', async () => {
      const roles = [{ id: '1' }, { id: '2' }];
      jest.spyOn(adapter as any, 'getAdminToken').mockResolvedValue('admin-token');
      mockHttpService.get.mockReturnValue(of({ data: { realmMappings: roles } }));

      const result = await adapter.findRolesByUserId('1');

      expect(result).toEqual(roles);
      expect(httpService.get).toHaveBeenCalled();
    });

    it('should return an empty array if no roles are mapped', async () => {
      jest.spyOn(adapter as any, 'getAdminToken').mockResolvedValue('admin-token');
      mockHttpService.get.mockReturnValue(of({ data: {} }));

      const result = await adapter.findRolesByUserId('1');

      expect(result).toEqual([]);
    });

    it('should throw NotFoundException on 404 error', async () => {
      jest.spyOn(adapter as any, 'getAdminToken').mockResolvedValue('admin-token');
      const error = new AxiosError('Not Found');
      error.response = { status: 404 } as AxiosResponse;
      mockHttpService.get.mockReturnValue(throwError(() => error));

      await expect(adapter.findRolesByUserId('1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException on other errors', async () => {
      jest.spyOn(adapter as any, 'getAdminToken').mockResolvedValue('admin-token');
      const error = new AxiosError('Some error');
      mockHttpService.get.mockReturnValue(throwError(() => error));

      await expect(adapter.findRolesByUserId('1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});