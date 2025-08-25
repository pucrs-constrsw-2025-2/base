import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Logger,
  Put,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleDto } from './dto/role.dto';
import { AuthGuard } from '../common/guards/auth.guard';

@Controller('roles')
@UseGuards(AuthGuard)
export class RolesController {
  private readonly logger = new Logger(RolesController.name);

  constructor(private readonly rolesService: RolesService) {}

  @Post()
  async create(@Body() createRoleDto: CreateRoleDto): Promise<RoleDto> {
    this.logger.log(`Creating role: ${createRoleDto.name}`);
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  async findAll(): Promise<RoleDto[]> {
    this.logger.log('Fetching all roles');
    return this.rolesService.findAll();
  }

  @Get(':name')
  async findOne(@Param('name') name: string): Promise<RoleDto> {
    this.logger.log(`Fetching role by name: ${name}`);
    return this.rolesService.findOne(name);
  }

  @Put(':name')
  async updatePut(
    @Param('name') name: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<void> {
    this.logger.log(`Updating role: ${name}`);
    return this.rolesService.update(name, updateRoleDto);
  }

  @Patch(':name')
  async update(
    @Param('name') name: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<void> {
    this.logger.log(`Updating role: ${name}`);
    return this.rolesService.update(name, updateRoleDto);
  }

  @Delete(':name')
  async remove(@Param('name') name: string): Promise<void> {
    this.logger.log(`Removing role: ${name}`);
    return this.rolesService.remove(name);
  }

  @Post(':name/users/:userId')
  async assignRoleToUser(
    @Param('name') name: string,
    @Param('userId') userId: string,
  ): Promise<{ message: string }> {
    this.logger.log(`Assigning role ${name} to user ${userId}`);
    return this.rolesService.assignRoleToUser(name, userId);
  }

  @Delete(':name/users/:userId')
  async removeRoleFromUser(
    @Param('name') name: string,
    @Param('userId') userId: string,
  ): Promise<{ message: string }> {
    this.logger.log(`Removing role ${name} from user ${userId}`);
    return this.rolesService.removeRoleFromUser(name, userId);
  }
}
