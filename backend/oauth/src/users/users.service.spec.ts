import axios from 'axios';
import { UsersService } from './users.service';
import { CustomHttpException } from '../common/errors/custom-httpexception';

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
    await expect(service.login('', '')).rejects.toBeInstanceOf(CustomHttpException);
  });

  it('createUser should validate email and throw on invalid', async () => {
    await expect(service.createUser('token', { username: 'nope', password: 'p' as any })).rejects.toBeInstanceOf(CustomHttpException);
  });

  it('createUser should create user and return id when keycloak returns 201', async () => {
    const location = 'http://host/admin/realms/realm/users/abc-123';
    mockedAxios.post.mockResolvedValueOnce({ status: 201, headers: { location } });
    // password reset call
    mockedAxios.put.mockResolvedValueOnce({ status: 204 });

    const result = await service.createUser('token', { username: 'a@b.com', password: 'pw', firstName: 'F', lastName: 'L' });
    expect(result.id).toBe('abc-123');
    expect(result.username).toBe('a@b.com');
    expect(mockedAxios.post).toHaveBeenCalled();
    expect(mockedAxios.put).toHaveBeenCalled();
  });

  it('getUserById should return mapped user when keycloak returns 200', async () => {
    const remote = { id: 'u1', username: 'u@k.com', firstName: 'X', lastName: 'Y', enabled: true };
    mockedAxios.get.mockResolvedValueOnce({ status: 200, data: remote });
    const res = await service.getUserById('token', 'u1');
    expect(res.id).toBe('u1');
    expect(res.username).toBe('u@k.com');
  });

  it('patchPassword should succeed when keycloak returns 204', async () => {
    mockedAxios.put.mockResolvedValueOnce({ status: 204 });
    await expect(service.patchPassword('token', 'u1', 'newpass')).resolves.toBeUndefined();
  });
});
