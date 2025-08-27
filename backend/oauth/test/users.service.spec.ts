import axios from 'axios';
import { CustomHttpException } from '../src/common/errors/custom-httpexception';
import { UsersService } from '../src/users/users.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(() => {
    // minimal env required by the service
    process.env.KEYCLOAK_INTERNAL_PROTOCOL = 'http';
    process.env.KEYCLOAK_INTERNAL_HOST = 'localhost';
    process.env.KEYCLOAK_INTERNAL_API_PORT = '8080';
    process.env.KEYCLOAK_REALM = 'realm';
    process.env.KEYCLOAK_CLIENT_ID = 'cid';
    process.env.KEYCLOAK_CLIENT_SECRET = 'secret';
    process.env.KEYCLOAK_GRANT_TYPE = 'password';

    service = new UsersService();
    jest.clearAllMocks();
  });

  it('login should return token on success', async () => {
    const tokenResp = {
      access_token: 'at',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'rt',
      refresh_expires_in: 3600,
    };
    mockedAxios.post.mockResolvedValueOnce({ status: 200, data: tokenResp });
    const result = await service.login('user', 'pass');
    expect(result.access_token).toBe('at');
    expect(mockedAxios.post).toHaveBeenCalled();
  });

  it('login should throw when username or password is missing', async () => {
    await expect(service.login('', '')).rejects.toBeInstanceOf(
      CustomHttpException,
    );
  });

  it('login should throw on 401 from keycloak', async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: { status: 401, data: { error_description: 'bad creds' } },
    });
    await expect(service.login('user', 'badpass')).rejects.toMatchObject({
      status: 401,
    });
  });

  it('login should throw on other keycloak error', async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: { status: 500, data: { error_description: 'server error' } },
    });
    await expect(service.login('user', 'pass')).rejects.toMatchObject({
      status: 500,
    });
  });

  it('login should throw on network error', async () => {
    mockedAxios.post.mockRejectedValueOnce({ message: 'network down' });
    await expect(service.login('user', 'pass')).rejects.toMatchObject({
      status: 500,
    });
  });

  it('authHeaders should throw if no token', () => {
    expect(() => (service as any).authHeaders(undefined)).toThrow(
      CustomHttpException,
    );
  });

  it('createUser should validate email and throw on invalid', async () => {
    await expect(
      service.createUser('token', { username: 'nope', password: 'p' as any }),
    ).rejects.toBeInstanceOf(CustomHttpException);
  });

  it('createUser should throw if username or password missing', async () => {
    await expect(
      service.createUser('token', { username: '', password: '' }),
    ).rejects.toBeInstanceOf(CustomHttpException);
  });

  it('createUser should create user and return id when keycloak returns 201', async () => {
    const location = 'http://host/admin/realms/realm/users/abc-123';
    mockedAxios.post.mockResolvedValueOnce({
      status: 201,
      headers: { location },
    });
    mockedAxios.put.mockResolvedValueOnce({ status: 204 });
    const result = await service.createUser('token', {
      username: 'a@b.com',
      password: 'pw',
      firstName: 'F',
      lastName: 'L',
    });
    expect(result.id).toBe('abc-123');
    expect(result.username).toBe('a@b.com');
    expect(mockedAxios.post).toHaveBeenCalled();
    expect(mockedAxios.put).toHaveBeenCalled();
  });

  it('createUser should throw on keycloak error', async () => {
    mockedAxios.post.mockResolvedValueOnce({
      status: 400,
      data: 'bad',
      headers: {},
    });
    await expect(
      service.createUser('token', { username: 'a@b.com', password: 'pw' }),
    ).rejects.toBeInstanceOf(CustomHttpException);
  });

  it('createUser should throw on axios error', async () => {
    mockedAxios.post.mockRejectedValueOnce({
      response: { status: 500, data: 'fail' },
    });
    await expect(
      service.createUser('token', { username: 'a@b.com', password: 'pw' }),
    ).rejects.toBeInstanceOf(CustomHttpException);
  });

  it('getUsers should return mapped users', async () => {
    const users = [
      { id: '1', username: 'a', firstName: 'F', lastName: 'L', enabled: true },
      { id: '2', username: 'b', firstName: 'G', lastName: 'H', enabled: false },
    ];
    mockedAxios.get.mockResolvedValueOnce({ data: users });
    const res = await service.getUsers('token');
    expect(res.length).toBe(2);
    expect(res[0].id).toBe('1');
  });

  it('getUsers should throw on keycloak error', async () => {
    mockedAxios.get.mockRejectedValueOnce({
      response: { status: 500, data: 'fail' },
    });
    await expect(service.getUsers('token')).rejects.toBeInstanceOf(
      CustomHttpException,
    );
  });

  it('getUsers should throw on axios error', async () => {
    mockedAxios.get.mockRejectedValueOnce({ message: 'fail' });
    await expect(service.getUsers('token')).rejects.toBeInstanceOf(
      CustomHttpException,
    );
  });

  it('getUserById should return mapped user when keycloak returns 200', async () => {
    const remote = {
      id: 'u1',
      username: 'u@k.com',
      firstName: 'X',
      lastName: 'Y',
      enabled: true,
    };
    mockedAxios.get.mockResolvedValueOnce({ status: 200, data: remote });
    const res = await service.getUserById('token', 'u1');
    expect(res.id).toBe('u1');
    expect(res.username).toBe('u@k.com');
  });

  it('getUserById should throw on 404', async () => {
    // Simulate axios error with response.status for 404
    mockedAxios.get.mockRejectedValueOnce({
      response: { status: 404, data: {} },
    });
    await expect(service.getUserById('token', 'u1')).rejects.toBeInstanceOf(
      CustomHttpException,
    );
  });

  it('getUserById should throw on other keycloak error', async () => {
    // Simulate axios error with response.status for 500
    mockedAxios.get.mockRejectedValueOnce({
      response: { status: 500, data: { errorMessage: 'fail' } },
    });
    await expect(service.getUserById('token', 'u1')).rejects.toBeInstanceOf(
      CustomHttpException,
    );
  });

  it('getUserById should throw on axios error', async () => {
    mockedAxios.get.mockRejectedValueOnce({
      response: { status: 500, data: { errorMessage: 'fail' } },
    });
    await expect(service.getUserById('token', 'u1')).rejects.toBeInstanceOf(
      CustomHttpException,
    );
  });

  it('getUserById should throw on network error', async () => {
    mockedAxios.get.mockRejectedValueOnce({ message: 'fail' });
    await expect(service.getUserById('token', 'u1')).rejects.toBeInstanceOf(
      CustomHttpException,
    );
  });

  it('updateUser should succeed on 204', async () => {
    mockedAxios.put.mockResolvedValueOnce({ status: 204 });
    await expect(
      service.updateUser('token', 'id', {
        username: 'a',
        firstName: 'b',
        lastName: 'c',
        enabled: true,
      }),
    ).resolves.toBeUndefined();
  });

  it('updateUser should throw on 404', async () => {
    mockedAxios.put.mockResolvedValueOnce({ status: 404, data: {} });
    await expect(
      service.updateUser('token', 'id', { username: 'a' }),
    ).rejects.toBeInstanceOf(CustomHttpException);
  });

  it('updateUser should throw on other keycloak error', async () => {
    mockedAxios.put.mockResolvedValueOnce({ status: 500, data: 'fail' });
    await expect(
      service.updateUser('token', 'id', { username: 'a' }),
    ).rejects.toBeInstanceOf(CustomHttpException);
  });

  it('updateUser should throw on axios error', async () => {
    mockedAxios.put.mockRejectedValueOnce({
      response: { status: 500, data: 'fail' },
    });
    await expect(
      service.updateUser('token', 'id', { username: 'a' }),
    ).rejects.toBeInstanceOf(CustomHttpException);
  });

  it('updateUser should throw on network error', async () => {
    mockedAxios.put.mockRejectedValueOnce({ message: 'fail' });
    await expect(
      service.updateUser('token', 'id', { username: 'a' }),
    ).rejects.toBeInstanceOf(CustomHttpException);
  });

  it('patchPassword should succeed when keycloak returns 204', async () => {
    mockedAxios.put.mockResolvedValueOnce({ status: 204 });
    await expect(
      service.patchPassword('token', 'u1', 'newpass'),
    ).resolves.toBeUndefined();
  });

  it('patchPassword should throw on 404', async () => {
    mockedAxios.put.mockResolvedValueOnce({ status: 404, data: {} });
    await expect(
      service.patchPassword('token', 'id', 'pw'),
    ).rejects.toBeInstanceOf(CustomHttpException);
  });

  it('patchPassword should throw on other keycloak error', async () => {
    mockedAxios.put.mockResolvedValueOnce({ status: 500, data: 'fail' });
    await expect(
      service.patchPassword('token', 'id', 'pw'),
    ).rejects.toBeInstanceOf(CustomHttpException);
  });

  it('patchPassword should throw on axios error', async () => {
    mockedAxios.put.mockRejectedValueOnce({
      response: { status: 500, data: 'fail' },
    });
    await expect(
      service.patchPassword('token', 'id', 'pw'),
    ).rejects.toBeInstanceOf(CustomHttpException);
  });

  it('patchPassword should throw on network error', async () => {
    mockedAxios.put.mockRejectedValueOnce({ message: 'fail' });
    await expect(
      service.patchPassword('token', 'id', 'pw'),
    ).rejects.toBeInstanceOf(CustomHttpException);
  });

  it('disableUser should succeed on 204', async () => {
    mockedAxios.put.mockResolvedValueOnce({ status: 204 });
    await expect(service.disableUser('token', 'id')).resolves.toBeUndefined();
  });

  it('disableUser should throw on 404', async () => {
    mockedAxios.put.mockResolvedValueOnce({ status: 404, data: {} });
    await expect(service.disableUser('token', 'id')).rejects.toBeInstanceOf(
      CustomHttpException,
    );
  });

  it('disableUser should throw on other keycloak error', async () => {
    mockedAxios.put.mockResolvedValueOnce({ status: 500, data: 'fail' });
    await expect(service.disableUser('token', 'id')).rejects.toBeInstanceOf(
      CustomHttpException,
    );
  });

  it('disableUser should throw on axios error', async () => {
    mockedAxios.put.mockRejectedValueOnce({
      response: { status: 500, data: 'fail' },
    });
    await expect(service.disableUser('token', 'id')).rejects.toBeInstanceOf(
      CustomHttpException,
    );
  });

  it('disableUser should throw on network error', async () => {
    mockedAxios.put.mockRejectedValueOnce({ message: 'fail' });
    await expect(service.disableUser('token', 'id')).rejects.toBeInstanceOf(
      CustomHttpException,
    );
  });
});
