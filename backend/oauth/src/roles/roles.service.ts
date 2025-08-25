import { Injectable, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleDto } from './dto/role.dto';
import type { IKeycloakAdapter } from '../keycloak/adapter/keycloak.adapter.interface';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);

  constructor(
    @Inject('IKeycloakAdapter')
    private readonly keycloakAdapter: IKeycloakAdapter,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<RoleDto> {
    this.logger.log(`Creating role: ${createRoleDto.name}`);
    return this.keycloakAdapter.createRole(createRoleDto);
  }

  async findAll(): Promise<RoleDto[]> {
    this.logger.log('Fetching all roles');
    return this.keycloakAdapter.findAllRoles();
  }

  async findOne(name: string): Promise<RoleDto> {
    this.logger.log(`Fetching role by name: ${name}`);
    return this.keycloakAdapter.findRoleByName(name);
  }

  async update(name: string, updateRoleDto: UpdateRoleDto): Promise<void> {
    this.logger.log(`Updating role: ${name}`);
    return this.keycloakAdapter.updateRole(name, updateRoleDto);
  }

  async remove(name: string): Promise<void> {
    this.logger.log(`Removing role: ${name}`);
    return this.keycloakAdapter.deleteRole(name);
  }

  async assignRoleToUser(roleName: string, userId: string): Promise<void> {
    this.logger.log(`Assigning role ${roleName} to user ${userId}`);
    return this.keycloakAdapter.assignRoleToUser(roleName, userId);
  }

  async removeRoleFromUser(roleName: string, userId: string): Promise<void> {
    this.logger.log(`Removing role ${roleName} from user ${userId}`);
    return this.keycloakAdapter.removeRoleFromUser(roleName, userId);
  }
}
