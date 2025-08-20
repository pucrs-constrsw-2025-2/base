import axios from 'axios';
import { RolesService } from './roles.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('RolesService', () => {
  let service: RolesService;

  beforeEach(() => {
    process.env.KEYCLOAK_INTERNAL_PROTOCOL = 'http';
    process.env.KEYCLOAK_INTERNAL_HOST = 'localhost';
    process.env.KEYCLOAK_INTERNAL_API_PORT = '8080';
    process.env.KEYCLOAK_REALM = 'realm';

    service = new RolesService();
    jest.clearAllMocks();
  });

  it('createRole should return role when keycloak responds 201', async () => {
    mockedAxios.post.mockResolvedValueOnce({ status: 201, data: {} });
    const role = { name: 'r1', description: 'd' };
    const res = await service.createRole('token', role);
    expect(res).toEqual(role);
    expect(mockedAxios.post).toHaveBeenCalled();
  });

  it('getRoles should return data from keycloak', async () => {
    const data = [{ id: 'r1', name: 'r1' }];
    mockedAxios.get.mockResolvedValueOnce({ status: 200, data });
    const res = await service.getRoles('token');
    expect(res).toBe(data);
  });

  it('getRoleById should return role when 200', async () => {
    const r = { id: 'r1', name: 'r1' };
    mockedAxios.get.mockResolvedValueOnce({ status: 200, data: r });
    const res = await service.getRoleById('token', 'r1');
    expect(res).toEqual(r);
  });

  it('updateRole should resolve when 204', async () => {
    mockedAxios.put.mockResolvedValueOnce({ status: 204 });
    await expect(service.updateRole('token', 'r1', { name: 'r1' })).resolves.toBeUndefined();
  });

  it('deleteRole should resolve when 204', async () => {
    mockedAxios.delete.mockResolvedValueOnce({ status: 204 });
    await expect(service.deleteRole('token', 'r1')).resolves.toBeUndefined();
  });

  it('addRoleToUser should fetch role and post to mappings', async () => {
    const role = { id: 'rid', name: 'r1' };
    mockedAxios.get.mockResolvedValueOnce({ status: 200, data: role });
    mockedAxios.post.mockResolvedValueOnce({ status: 204 });
    await expect(service.addRoleToUser('token', 'u1', 'r1')).resolves.toBeUndefined();
    expect(mockedAxios.get).toHaveBeenCalled();
    expect(mockedAxios.post).toHaveBeenCalled();
  });

  it('removeRoleFromUser should fetch role and delete with body', async () => {
    const role = { id: 'rid', name: 'r1' };
    mockedAxios.get.mockResolvedValueOnce({ status: 200, data: role });
    mockedAxios.delete.mockResolvedValueOnce({ status: 204 });
    await expect(service.removeRoleFromUser('token', 'u1', 'r1')).resolves.toBeUndefined();
    expect(mockedAxios.get).toHaveBeenCalled();
    expect(mockedAxios.delete).toHaveBeenCalled();
  });
});
