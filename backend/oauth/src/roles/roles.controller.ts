import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiProperty, // Importado para o DTO de resposta
} from '@nestjs/swagger';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleDto } from './dto/role.dto';
import { AuthGuard } from '../common/guards/auth.guard';

// DTO auxiliar para respostas de mensagem, para documentação clara
class MessageResponseDto {
  @ApiProperty({ example: 'Operação realizada com sucesso.' })
  message: string;
}

@ApiTags('Roles')
@ApiBearerAuth() // Exige token JWT para todos os endpoints deste controller
@Controller('roles')
@UseGuards(AuthGuard)
export class RolesController {
  private readonly logger = new Logger(RolesController.name);

  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma nova role' })
  @ApiResponse({ status: 201, description: 'Role criada com sucesso.', type: RoleDto })
  @ApiResponse({ status: 409, description: 'Uma role com este nome já existe.' })
  async create(@Body() createRoleDto: CreateRoleDto): Promise<RoleDto> {
    this.logger.log(`Creating role: ${createRoleDto.name}`);
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todas as roles' })
  @ApiResponse({ status: 200, description: 'Lista de roles retornada com sucesso.', type: [RoleDto] })
  async findAll(): Promise<RoleDto[]> {
    this.logger.log('Fetching all roles');
    return this.rolesService.findAll();
  }

  @Get(':name')
  @ApiOperation({ summary: 'Busca uma role pelo nome' })
  @ApiParam({ name: 'name', description: 'O nome da role' })
  @ApiResponse({ status: 200, description: 'Role encontrada.', type: RoleDto })
  @ApiResponse({ status: 404, description: 'Role não encontrada.' })
  async findOne(@Param('name') name: string): Promise<RoleDto> {
    this.logger.log(`Fetching role by name: ${name}`);
    return this.rolesService.findOne(name);
  }

  @Put(':name')
  @ApiOperation({ summary: 'Atualiza uma role (substituição completa)' })
  @ApiParam({ name: 'name', description: 'O nome da role a ser atualizada' })
  @ApiResponse({ status: 204, description: 'Role atualizada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Role não encontrada.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePut(
    @Param('name') name: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<void> {
    this.logger.log(`Updating role: ${name}`);
    return this.rolesService.update(name, updateRoleDto);
  }

  @Patch(':name')
  @ApiOperation({ summary: 'Atualiza parcialmente uma role' })
  @ApiParam({ name: 'name', description: 'O nome da role a ser atualizada' })
  @ApiResponse({ status: 204, description: 'Role atualizada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Role não encontrada.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async update(
    @Param('name') name: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ): Promise<void> {
    this.logger.log(`Updating role: ${name}`);
    return this.rolesService.update(name, updateRoleDto);
  }

  @Delete(':name')
  @ApiOperation({ summary: 'Remove uma role' })
  @ApiParam({ name: 'name', description: 'O nome da role a ser removida' })
  @ApiResponse({ status: 204, description: 'Role removida com sucesso.' })
  @ApiResponse({ status: 404, description: 'Role não encontrada.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('name') name: string): Promise<void> {
    this.logger.log(`Removing role: ${name}`);
    return this.rolesService.remove(name);
  }

  @Post(':name/users/:userId')
  @ApiOperation({ summary: 'Associa uma role a um usuário' })
  @ApiParam({ name: 'name', description: 'O nome da role a ser associada' })
  @ApiParam({ name: 'userId', description: 'O ID do usuário' })
  @ApiResponse({ status: 201, description: 'Role associada com sucesso.', type: MessageResponseDto })
  @ApiResponse({ status: 404, description: 'Usuário ou role não encontrado.' })
  async assignRoleToUser(
    @Param('name') name: string,
    @Param('userId') userId: string,
  ): Promise<{ message: string }> {
    this.logger.log(`Assigning role ${name} to user ${userId}`);
    return this.rolesService.assignRoleToUser(name, userId);
  }

  @Delete(':name/users/:userId')
  @ApiOperation({ summary: 'Remove uma role de um usuário' })
  @ApiParam({ name: 'name', description: 'O nome da role a ser removida' })
  @ApiParam({ name: 'userId', description: 'O ID do usuário' })
  @ApiResponse({ status: 200, description: 'Role removida do usuário com sucesso.', type: MessageResponseDto })
  @ApiResponse({ status: 404, description: 'Usuário ou role não encontrado.' })
  async removeRoleFromUser(
    @Param('name') name: string,
    @Param('userId') userId: string,
  ): Promise<{ message: string }> {
    this.logger.log(`Removing role ${name} from user ${userId}`);
    return this.rolesService.removeRoleFromUser(name, userId);
  }
}