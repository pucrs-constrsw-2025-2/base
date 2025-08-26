import { Inject, Injectable, Logger } from '@nestjs/common';
import type { IKeycloakAdapter } from 'src/keycloak/adapter/keycloak.adapter.interface';
import { RoleDto } from 'src/roles/dto/role.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @Inject('IKeycloakAdapter')
    private readonly keycloakAdapter: IKeycloakAdapter,
  ) {}

  create(createUserDto: CreateUserDto) {
    this.logger.log(`Service: creating user ${createUserDto.username}`);
    return this.keycloakAdapter.createUser(createUserDto);
  }

  findAll() {
    this.logger.log('Service: finding all users');
    return this.keycloakAdapter.findAllUsers();
  }

  findOne(id: string) {
    this.logger.log(`Service: finding user with id ${id}`);
    return this.keycloakAdapter.findUserById(id);
  }

  findRolesByUserId(id: string): Promise<RoleDto[]> {
    this.logger.log(`Service: finding roles for user with id ${id}`);
    return this.keycloakAdapter.findRolesByUserId(id);
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    this.logger.log(`Service: updating user with id ${id}`);
    return this.keycloakAdapter.updateUser(id, updateUserDto);
  }

  async updatePassword(id: string, updatePasswordDto: UpdatePasswordDto) {
    this.logger.log(`Service: updating password for user with id ${id}`);
    await this.keycloakAdapter.updatePassword(id, updatePasswordDto);
  }

  remove(id: string) {
    this.logger.log(`Service: removing user with id ${id}`);
    return this.keycloakAdapter.deleteUser(id);
  }
}
