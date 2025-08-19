import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import type { CreateUserDto } from './dto/create-user.dto';
import type { UpdateUserDto } from './dto/update-user.dto';
import type { UserDto } from './dto/user.dto';

const mockUsersService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        username: 'test',
        email: 'test@example.com',
        password: 'password',
        firstName: 'Test',
        lastName: 'User',
      };
      const result = { id: 'a-uuid' };
      (service.create as jest.Mock).mockResolvedValue(result);

      expect(await controller.create(createUserDto)).toBe(result);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result: UserDto[] = [
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
      ];
      (service.findAll as jest.Mock).mockResolvedValue(result);

      expect(await controller.findAll()).toBe(result);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      const id = '1';
      const result: UserDto = {
        id: '1',
        username: 'user1',
        email: 'user1@test.com',
        firstName: 'User',
        lastName: 'One',
        enabled: true,
        emailVerified: true,
        createdTimestamp: Date.now(),
      };
      (service.findOne as jest.Mock).mockResolvedValue(result);

      expect(await controller.findOne(id)).toBe(result);
      expect(service.findOne).toHaveBeenCalledWith(id);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const id = '1';
      const updateUserDto: UpdateUserDto = { firstName: 'Updated' };
      (service.update as jest.Mock).mockResolvedValue(undefined);

      await controller.update(id, updateUserDto);

      expect(service.update).toHaveBeenCalledWith(id, updateUserDto);
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const id = '1';
      (service.remove as jest.Mock).mockResolvedValue(undefined);

      await controller.remove(id);

      expect(service.remove).toHaveBeenCalledWith(id);
    });
  });
});
