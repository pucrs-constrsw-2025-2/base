import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleDto } from './dto/role.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { Reflector } from '@nestjs/core';

describe('RolesController', () => {
  let controller: RolesController;
  let mockRolesService: jest.Mocked<RolesService>;

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      assignRoleToUser: jest.fn(),
      removeRoleFromUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
          useValue: mockService,
        },
        {
          provide: AuthGuard,
          useValue: jest.fn().mockImplementation(() => true),
        },
        {
          provide: 'IKeycloakAdapter',
          useValue: {},
        },
        {
          provide: Reflector,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);
    mockRolesService = module.get(RolesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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

      mockRolesService.create.mockResolvedValue(expectedRole);

      const result = await controller.create(createRoleDto);

      expect(result).toEqual(expectedRole);
      expect(mockRolesService.create).toHaveBeenCalledWith(createRoleDto);
    });
  });

  describe('findAll', () => {
    it('should return all roles', async () => {
      const expectedRoles: RoleDto[] = [
        { id: '1', name: 'admin', clientRole: true },
        { id: '2', name: 'user', clientRole: true },
      ];

      mockRolesService.findAll.mockResolvedValue(expectedRoles);

      const result = await controller.findAll();

      expect(result).toEqual(expectedRoles);
      expect(mockRolesService.findAll).toHaveBeenCalled();
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

      mockRolesService.findOne.mockResolvedValue(expectedRole);

      const result = await controller.findOne(roleName);

      expect(result).toEqual(expectedRole);
      expect(mockRolesService.findOne).toHaveBeenCalledWith(roleName);
    });
  });

  describe('update', () => {
    it('should update a role', async () => {
      const roleName = 'admin';
      const updateRoleDto: UpdateRoleDto = {
        description: 'Administrador com privilégios elevados',
      };

      mockRolesService.update.mockResolvedValue(undefined);

      await controller.update(roleName, updateRoleDto);

      expect(mockRolesService.update).toHaveBeenCalledWith(
        roleName,
        updateRoleDto,
      );
    });
  });

  describe('remove', () => {
    it('should remove a role', async () => {
      const roleName = 'admin';

      mockRolesService.remove.mockResolvedValue(undefined);

      await controller.remove(roleName);

      expect(mockRolesService.remove).toHaveBeenCalledWith(roleName);
    });
  });

  describe('assignRoleToUser', () => {
    it('should assign a role to a user', async () => {
      const roleName = 'admin';
      const userId = 'user123';

      mockRolesService.assignRoleToUser.mockResolvedValue(undefined);

      await controller.assignRoleToUser(roleName, userId);

      expect(mockRolesService.assignRoleToUser).toHaveBeenCalledWith(
        roleName,
        userId,
      );
    });
  });

  describe('removeRoleFromUser', () => {
    it('should remove a role from a user', async () => {
      const roleName = 'admin';
      const userId = 'user123';

      mockRolesService.removeRoleFromUser.mockResolvedValue(undefined);

      await controller.removeRoleFromUser(roleName, userId);

      expect(mockRolesService.removeRoleFromUser).toHaveBeenCalledWith(
        roleName,
        userId,
      );
    });
  });
});
