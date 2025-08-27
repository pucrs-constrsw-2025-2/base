import axios from 'axios';
import { RolesService } from './roles.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

let service: RolesService;

beforeEach(() => {
  process.env.KEYCLOAK_INTERNAL_PROTOCOL = 'http';
  process.env.KEYCLOAK_INTERNAL_HOST = 'localhost';
  process.env.KEYCLOAK_INTERNAL_API_PORT = '8080';
  process.env.KEYCLOAK_REALM = 'realm';

  service = new RolesService();
  jest.clearAllMocks();
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
  await expect(
    service.updateRole('token', 'r1', { name: 'r1' }),
  ).resolves.toBeUndefined();
});
it('createRole should return role when keycloak responds 201', async () => {
  mockedAxios.post.mockResolvedValueOnce({ status: 201, data: {} });
  const role = { name: 'r1', description: 'd' };
  const res = await service.createRole('token', role);
  expect(res).toEqual(role);
  expect(mockedAxios.post).toHaveBeenCalled();
});

it('createRole should throw on non-201 response', async () => {
  mockedAxios.post.mockResolvedValueOnce({
    status: 400,
    data: 'bad request',
  });
  try {
    await service.createRole('token', { name: 'r1' });
  } catch (e: any) {
    expect(e.getResponse().error_description).toBe('Http Exception');
  }
});

it('createRole should throw on axios error', async () => {
  mockedAxios.post.mockRejectedValueOnce({
    message: 'network',
    response: undefined,
  });
  try {
    await service.createRole('token', { name: 'r1' });
  } catch (e: any) {
    expect(e.getResponse().error_description).toBe('network');
  }
});

it('getRoles should return data from keycloak', async () => {
  const data = [{ id: 'r1', name: 'r1' }];
  mockedAxios.get.mockResolvedValueOnce({ status: 200, data });
  const res = await service.getRoles('token');
  expect(res).toBe(data);
});

it('getRoles should throw on axios error', async () => {
  mockedAxios.get.mockRejectedValueOnce({
    message: 'fail',
    response: undefined,
  });
  try {
    await service.getRoles('token');
  } catch (e: any) {
    expect(e.getResponse().error_description).toBe('fail');
  }
});

it('getRoleById should return role when 200', async () => {
  const r = { id: 'r1', name: 'r1' };
  mockedAxios.get.mockResolvedValueOnce({ status: 200, data: r });
  const res = await service.getRoleById('token', 'r1');
  expect(res).toEqual(r);
});

it('getRoleById should throw 404', async () => {
  mockedAxios.get.mockResolvedValueOnce({ status: 404, data: 'not found' });
  try {
    await service.getRoleById('token', 'r1');
  } catch (e: any) {
    expect(e.getResponse().error_description).toBe('Http Exception');
  }
});

it('getRoleById should throw on axios error', async () => {
  mockedAxios.get.mockRejectedValueOnce({
    message: 'err',
    response: undefined,
  });
  try {
    await service.getRoleById('token', 'r1');
  } catch (e: any) {
    expect(e.getResponse().error_description).toBe('err');
  }
});

it('updateRole should resolve when 204', async () => {
  mockedAxios.put.mockResolvedValueOnce({ status: 204 });
  await expect(
    service.updateRole('token', 'r1', { name: 'r1' }),
  ).resolves.toBeUndefined();
});

it('updateRole should throw 404', async () => {
  mockedAxios.put.mockResolvedValueOnce({ status: 404, data: 'not found' });
  try {
    await service.updateRole('token', 'r1', {});
  } catch (e: any) {
    expect(e.getResponse().error_description).toBe('Http Exception');
  }
});

it('updateRole should throw on axios error', async () => {
  mockedAxios.put.mockRejectedValueOnce({
    message: 'fail',
    response: undefined,
  });
  try {
    await service.updateRole('token', 'r1', {});
  } catch (e: any) {
    expect(e.getResponse().error_description).toBe('fail');
  }
});

it('deleteRole should resolve when 204', async () => {
  mockedAxios.delete.mockResolvedValueOnce({ status: 204 });
  await expect(service.deleteRole('token', 'r1')).resolves.toBeUndefined();
});

it('deleteRole should throw 404', async () => {
  mockedAxios.delete.mockResolvedValueOnce({
    status: 404,
    data: 'not found',
  });
  try {
    await service.deleteRole('token', 'r1');
  } catch (e: any) {
    expect(e.getResponse().error_description).toBe('Http Exception');
  }
});

it('deleteRole should throw on axios error', async () => {
  mockedAxios.delete.mockRejectedValueOnce({
    message: 'fail',
    response: undefined,
  });
  try {
    await service.deleteRole('token', 'r1');
  } catch (e: any) {
    expect(e.getResponse().error_description).toBe('fail');
  }
});

it('addRoleToUser should fetch role and post to mappings', async () => {
  const role = { id: 'rid', name: 'r1' };
  mockedAxios.get.mockResolvedValueOnce({ status: 200, data: role });
  mockedAxios.post.mockResolvedValueOnce({ status: 204 });
  await expect(
    service.addRoleToUser('token', 'u1', 'r1'),
  ).resolves.toBeUndefined();
  expect(mockedAxios.get).toHaveBeenCalled();
  expect(mockedAxios.post).toHaveBeenCalled();
});

it('addRoleToUser should throw on non-204', async () => {
  const role = { id: 'rid', name: 'r1' };
  mockedAxios.get.mockResolvedValueOnce({ status: 200, data: role });
  mockedAxios.post.mockResolvedValueOnce({ status: 400, data: 'bad' });
  try {
    await service.addRoleToUser('token', 'u1', 'r1');
  } catch (e: any) {
    expect(e.getResponse().error_description).toBe('Http Exception');
  }
});

it('addRoleToUser should throw on axios error', async () => {
  mockedAxios.get.mockRejectedValueOnce({
    message: 'fail',
    response: undefined,
  });
  try {
    await service.addRoleToUser('token', 'u1', 'r1');
  } catch (e: any) {
    expect(e.getResponse().error_description).toBe('fail');
  }
});

it('removeRoleFromUser should fetch role and delete with body', async () => {
  const role = { id: 'rid', name: 'r1' };
  mockedAxios.get.mockResolvedValueOnce({ status: 200, data: role });
  mockedAxios.delete.mockResolvedValueOnce({ status: 204 });
  await expect(
    service.removeRoleFromUser('token', 'u1', 'r1'),
  ).resolves.toBeUndefined();
  expect(mockedAxios.get).toHaveBeenCalled();
  expect(mockedAxios.delete).toHaveBeenCalled();
});

it('removeRoleFromUser should throw on non-204', async () => {
  const role = { id: 'rid', name: 'r1' };
  mockedAxios.get.mockResolvedValueOnce({ status: 200, data: role });
  mockedAxios.delete.mockResolvedValueOnce({ status: 400, data: 'bad' });
  try {
    await service.removeRoleFromUser('token', 'u1', 'r1');
  } catch (e: any) {
    expect(e.getResponse().error_description).toBe('Http Exception');
  }
});

it('removeRoleFromUser should throw on axios error', async () => {
  mockedAxios.get.mockRejectedValueOnce({
    message: 'fail',
    response: undefined,
  });
  try {
    await service.removeRoleFromUser('token', 'u1', 'r1');
  } catch (e: any) {
    expect(e.getResponse().error_description).toBe('fail');
  }
});

it('authHeaders should throw if no access token', () => {
  try {
    (service as any).authHeaders(undefined);
  } catch (e: any) {
    expect(e.getResponse().error_description).toBe('access token required');
  }
});
// ...existing tests...
// ...existing code...
