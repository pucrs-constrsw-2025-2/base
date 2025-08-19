import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import type { IKeycloakAdapter } from 'src/keycloak/adapter/keycloak.adapter.interface';
import type { CreateUserDto } from './dto/create-user.dto';
import type { UpdateUserDto } from './dto/update-user.dto';
import type { UserDto } from './dto/user.dto';
import { NotFoundException } from '@nestjs/common';

const mockKeycloakAdapter: IKeycloakAdapter = {
  login: jest.fn(),
  createUser: jest.fn(),
  findAllUsers: jest.fn(),
  findUserById: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
  validateToken: jest.fn(),
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
        password: 'password',
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
});
