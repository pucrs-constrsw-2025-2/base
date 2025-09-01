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
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RoleDto } from 'src/roles/dto/role.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Cria um novo usuário' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso.', type: UserDto })
  @ApiResponse({ status: 400, description: 'Dados inválidos.' })
  @ApiResponse({ status: 403, description: 'Acesso negado.' })
  create(@Body() createUserDto: CreateUserDto) {
    this.logger.log(
      `Controller: POST /users request with username: ${createUserDto.username}`,
    );
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os usuários' })
  @ApiResponse({ status: 200, description: 'Lista de usuários retornada com sucesso.', type: [UserDto] })
  findAll() {
    this.logger.log('Controller: GET /users request');
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um usuário pelo ID' })
  @ApiParam({ name: 'id', description: 'O ID do usuário' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado.', type: UserDto })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  findOne(@Param('id') id: string) {
    this.logger.log(`Controller: GET /users/${id} request`);
    return this.usersService.findOne(id);
  }

  @Get(':id/roles')
  @ApiOperation({ summary: 'Lista as roles de um usuário específico' })
  @ApiParam({ name: 'id', description: 'O ID do usuário' })
  @ApiResponse({ status: 200, description: 'Lista de roles do usuário.', type: [RoleDto] })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  findRolesByUserId(@Param('id') id: string): Promise<RoleDto[]> {
    this.logger.log(`Controller: GET /users/${id}/roles request`);
    return this.usersService.findRolesByUserId(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza os dados de um usuário' })
  @ApiParam({ name: 'id', description: 'O ID do usuário a ser atualizado' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso.', type: UserDto })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    this.logger.log(`Controller: PUT /users/${id} request`);
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/password')
  @ApiOperation({ summary: 'Atualiza a senha de um usuário' })
  @ApiParam({ name: 'id', description: 'O ID do usuário' })
  @ApiResponse({ status: 204, description: 'Senha atualizada com sucesso.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePassword(
    @Param('id') id: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    this.logger.log(`Controller: PATCH /users/${id}/password request`);
    await this.usersService.updatePassword(id, updatePasswordDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove um usuário' })
  @ApiParam({ name: 'id', description: 'O ID do usuário a ser removido' })
  @ApiResponse({ status: 204, description: 'Usuário removido com sucesso.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    this.logger.log(`Controller: DELETE /users/${id} request`);
    return this.usersService.remove(id);
  }
}