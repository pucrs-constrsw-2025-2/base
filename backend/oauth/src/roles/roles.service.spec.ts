import { Test, TestingModule } from '@nestjs/testing';
import { RolesService } from './roles.service';
import { IKeycloakAdapter } from '../keycloak/adapter/keycloak.adapter.interface';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleDto } from './dto/role.dto';

describe('RolesService', () => {
  let service: RolesService;
  let mockKeycloakAdapter: jest.Mocked<IKeycloakAdapter>;

  beforeEach(async () => {
    const mockAdapter = {
      createRole: jest.fn(),
      findAllRoles: jest.fn(),
      findRoleByName: jest.fn(),
      updateRole: jest.fn(),
      deleteRole: jest.fn(),
      assignRoleToUser: jest.fn(),
      removeRoleFromUser: jest.fn(),
      login: jest.fn(),
      createUser: jest.fn(),
      findAllUsers: jest.fn(),
      findUserById: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
      validateToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: 'IKeycloakAdapter',
          useValue: mockAdapter,
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    mockKeycloakAdapter = module.get('IKeycloakAdapter');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a role', async () => {
      const createRoleDto: CreateRoleDto = {
        name: 'admin',
        description: 'Administrador do sistema',
      };
      const expectedRole: RoleDto = {
        id: '1',
        name: 'admin',
        description: 'Administrador do sistema',
        clientRole: true,
      };

      mockKeycloakAdapter.createRole.mockResolvedValue(expectedRole);

      const result = await service.create(createRoleDto);

      expect(result).toEqual(expectedRole);
      expect(mockKeycloakAdapter.createRole).toHaveBeenCalledWith(
        createRoleDto,
      );
    });
  });

  describe('findAll', () => {
    it('should return all roles', async () => {
      const expectedRoles: RoleDto[] = [
        { id: '1', name: 'admin', clientRole: true },
        { id: '2', name: 'user', clientRole: true },
      ];

      mockKeycloakAdapter.findAllRoles.mockResolvedValue(expectedRoles);

      const result = await service.findAll();

      expect(result).toEqual(expectedRoles);
      expect(mockKeycloakAdapter.findAllRoles).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a role by name', async () => {
      const roleName = 'admin';
      const expectedRole: RoleDto = {
        id: '1',
        name: 'admin',
        clientRole: true,
      };

      mockKeycloakAdapter.findRoleByName.mockResolvedValue(expectedRole);

      const result = await service.findOne(roleName);

      expect(result).toEqual(expectedRole);
      expect(mockKeycloakAdapter.findRoleByName).toHaveBeenCalledWith(roleName);
    });
  });

  describe('update', () => {
    it('should update a role', async () => {
      const roleName = 'admin';
      const updateRoleDto: UpdateRoleDto = {
        description: 'Administrador com privilégios elevados',
      };

      mockKeycloakAdapter.updateRole.mockResolvedValue(undefined);

      await service.update(roleName, updateRoleDto);

      expect(mockKeycloakAdapter.updateRole).toHaveBeenCalledWith(
        roleName,
        updateRoleDto,
      );
    });
  });

  describe('remove', () => {
    it('should remove a role', async () => {
      const roleName = 'admin';

      mockKeycloakAdapter.deleteRole.mockResolvedValue(undefined);

      await service.remove(roleName);

      expect(mockKeycloakAdapter.deleteRole).toHaveBeenCalledWith(roleName);
    });
  });

  describe('assignRoleToUser', () => {
    it('should assign a role to a user', async () => {
      const roleName = 'admin';
      const userId = 'user123';

      mockKeycloakAdapter.assignRoleToUser.mockResolvedValue(undefined);

      await service.assignRoleToUser(roleName, userId);

      expect(mockKeycloakAdapter.assignRoleToUser).toHaveBeenCalledWith(
        roleName,
        userId,
      );
    });
  });

  describe('removeRoleFromUser', () => {
    it('should remove a role from a user', async () => {
      const roleName = 'admin';
      const userId = 'user123';

      mockKeycloakAdapter.removeRoleFromUser.mockResolvedValue(undefined);

      await service.removeRoleFromUser(roleName, userId);

      expect(mockKeycloakAdapter.removeRoleFromUser).toHaveBeenCalledWith(
        roleName,
        userId,
      );
    });
  });
});
