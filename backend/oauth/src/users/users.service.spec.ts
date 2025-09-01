import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import type { IKeycloakAdapter } from 'src/keycloak/adapter/keycloak.adapter.interface';
import type { CreateUserDto } from './dto/create-user.dto';
import type { UpdateUserDto } from './dto/update-user.dto';
import type { UserDto } from './dto/user.dto';
import { NotFoundException } from '@nestjs/common';
import { RoleDto } from 'src/roles/dto/role.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';

const mockKeycloakAdapter: IKeycloakAdapter = {
  login: jest.fn(),
  createUser: jest.fn(),
  findAllUsers: jest.fn(),
  findUserById: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
  validateToken: jest.fn(),
  findRolesByUserId: jest.fn(),
  updatePassword: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;
  let keycloakAdapter: IKeycloakAdapter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: 'IKeycloakAdapter',
          useValue: mockKeycloakAdapter,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    keycloakAdapter = module.get<IKeycloakAdapter>('IKeycloakAdapter');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user and return the id', async () => {
      const createUserDto: CreateUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: process.env.TEST_USER_PASSWORD as string,
        firstName: 'Test',
        lastName: 'User',
      };
      const expectedResult = { id: 'some-uuid' };
      (keycloakAdapter.createUser as jest.Mock).mockResolvedValue(
        expectedResult,
      );

      const result = await service.create(createUserDto);

      expect(keycloakAdapter.createUser).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const expectedUsers: UserDto[] = [
        {
          id: '1',
          username: 'user1',
          email: 'user1@test.com',
          firstName: 'User',
          lastName: 'One',
          enabled: true,
          emailVerified: true,
          createdTimestamp: Date.now(),
        },
        {
          id: '2',
          username: 'user2',
          email: 'user2@test.com',
          firstName: 'User',
          lastName: 'Two',
          enabled: true,
          emailVerified: false,
          createdTimestamp: Date.now(),
        },
      ];
      (keycloakAdapter.findAllUsers as jest.Mock).mockResolvedValue(
        expectedUsers,
      );

      const result = await service.findAll();

      expect(keycloakAdapter.findAllUsers).toHaveBeenCalled();
      expect(result).toEqual(expectedUsers);
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      const userId = '1';
      const expectedUser: UserDto = {
        id: '1',
        username: 'user1',
        email: 'user1@test.com',
        firstName: 'User',
        lastName: 'One',
        enabled: true,
        emailVerified: true,
        createdTimestamp: Date.now(),
      };
      (keycloakAdapter.findUserById as jest.Mock).mockResolvedValue(
        expectedUser,
      );

      const result = await service.findOne(userId);

      expect(keycloakAdapter.findUserById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedUser);
    });

    it('should throw NotFoundException if user is not found', async () => {
      const userId = 'non-existent-id';
      (keycloakAdapter.findUserById as jest.Mock).mockRejectedValue(
        new NotFoundException(),
      );

      await expect(service.findOne(userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a user successfully', async () => {
      const userId = '1';
      const updateUserDto: UpdateUserDto = { firstName: 'Updated' };
      (keycloakAdapter.updateUser as jest.Mock).mockResolvedValue(undefined);

      await service.update(userId, updateUserDto);

      expect(keycloakAdapter.updateUser).toHaveBeenCalledWith(
        userId,
        updateUserDto,
      );
    });
  });

  describe('remove', () => {
    it('should remove a user successfully', async () => {
      const userId = '1';
      (keycloakAdapter.deleteUser as jest.Mock).mockResolvedValue(undefined);

      await service.remove(userId);

      expect(keycloakAdapter.deleteUser).toHaveBeenCalledWith(userId);
    });
  });

  describe('findRolesByUserId', () => {
    it('should return roles for a given user id', async () => {
      const userId = '1';
      const expectedRoles: RoleDto[] = [
        {
          id: 'role-id-1',
          name: 'role1',
          description: 'Role 1 description',
          composite: false,
          clientRole: true,
          containerId: 'container-id-1',
        },
        {
          id: 'role-id-2',
          name: 'role2',
          description: 'Role 2 description',
          composite: false,
          clientRole: true,
          containerId: 'container-id-2',
        },
      ];
      (keycloakAdapter.findRolesByUserId as jest.Mock).mockResolvedValue(
        expectedRoles,
      );

      const result = await service.findRolesByUserId(userId);

      expect(keycloakAdapter.findRolesByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedRoles);
    });
  });

  describe('updatePassword', () => {
    it('should update a users password', async () => {
      const userId = '1';
      const updatePasswordDto: UpdatePasswordDto = {
        type: 'password',
        value: process.env.TEST_NEW_PASSWORD as string,
        temporary: false,
      };
      (keycloakAdapter.updatePassword as jest.Mock).mockResolvedValue(undefined);

      await service.updatePassword(userId, updatePasswordDto);

      expect(keycloakAdapter.updatePassword).toHaveBeenCalledWith(
        userId,
        updatePasswordDto,
      );
    });
  });
});
