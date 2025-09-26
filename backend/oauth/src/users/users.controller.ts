import 'dotenv/config';
import { Controller, Post, Body, HttpCode, HttpStatus, Headers, Get, Query, Param, Put, Patch, Delete, Res, UseInterceptors, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { LoginDto } from './dtos/login.dto';
import type { Response } from 'express';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { PatchPasswordDto } from './dtos/patch-password.dto';
import { AuthToken } from 'src/common/decorators/auth-token.decorator';

@ApiTags('users')
@Controller('')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseInterceptors(FileFieldsInterceptor([]))
  @Post('login')
  @HttpCode(201)
  @ApiOperation({ summary: 'Login do usuário' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 201, description: 'Usuário autenticado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Erro na estrutura da chamada.' })
  @ApiResponse({ status: 401, description: 'Username e/ou password inválidos.' })
  async login(@Body() body: any) {
    const username = body.username ?? body['username'];
    const password = body.password ?? body['password'];
    const token = await this.usersService.login(username, password);
    return {
      token_type: token.token_type,
      access_token: token.access_token,
      expires_in: token.expires_in,
      refresh_token: token.refresh_token,
      refresh_expires_in: token.refresh_expires_in,
    };
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Renova o access_token usando refresh_token' })
  @ApiBody({ schema: { properties: { refresh_token: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Novo access_token gerado.' })
  @ApiResponse({ status: 400, description: 'Refresh token inválido.' })
  async refresh(@Body('refresh_token') refreshToken: string) {
    const token = await this.usersService.refreshToken(refreshToken);
    return {
      token_type: token.token_type,
      access_token: token.access_token,
      expires_in: token.expires_in,
      refresh_token: token.refresh_token,
      refresh_expires_in: token.refresh_expires_in,
    };
  }

  @Post('users')
  @ApiOperation({ summary: 'Cria um novo usuário' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Erro na estrutura da chamada ou e-mail inválido.' })
  @ApiResponse({ status: 401, description: 'Access token inválido.' })
  @ApiResponse({ status: 403, description: 'Access token não concede permissão.' })
  @ApiResponse({ status: 409, description: 'Username já existente.' })
  @ApiBearerAuth()
  async createUser(@AuthToken() token: string, @Body() body: CreateUserDto, @Res() res: Response) {
    const created = await this.usersService.createUser(token, { username: body.username, password: body.password, firstName: body['first-name'], lastName: body['last-name'] });
    return res.status(HttpStatus.CREATED).json(created);
  }

  @Get('users')
  @ApiOperation({ summary: 'Lista todos os usuários' })
  @ApiQuery({ name: 'enabled', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Lista de usuários.' })
  @ApiResponse({ status: 400, description: 'Erro na estrutura do request.' })
  @ApiResponse({ status: 401, description: 'Access token inválido.' })
  @ApiResponse({ status: 403, description: 'Access token não concede permissão.' })
  @ApiBearerAuth()
  async getUsers(@AuthToken() token: string, @Query('enabled') enabled?: string) {
    return await this.usersService.getUsers(token, enabled);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Busca um usuário pelo ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Usuário encontrado.' })
  @ApiResponse({ status: 400, description: 'Erro na estrutura da chamada.' })
  @ApiResponse({ status: 401, description: 'Access token inválido.' })
  @ApiResponse({ status: 403, description: 'Access token não concede permissão.' })
  @ApiResponse({ status: 404, description: 'Usuário não localizado.' })
  @ApiBearerAuth()
  async getUser(@AuthToken() token: string, @Param('id') id: string) {
    return await this.usersService.getUserById(token, id);
  }

  @Put('users/:id')
  @ApiOperation({ summary: 'Atualiza um usuário' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'Usuário atualizado.' })
  @ApiResponse({ status: 400, description: 'Erro na estrutura da chamada.' })
  @ApiResponse({ status: 401, description: 'Access token inválido.' })
  @ApiResponse({ status: 403, description: 'Access token não concede permissão.' })
  @ApiResponse({ status: 404, description: 'Usuário não localizado.' })
  @ApiBearerAuth()
  async updateUser(@AuthToken() token: string, @Param('id') id: string, @Body() body: UpdateUserDto) {
    const updatedUser = await this.usersService.updateUser(token, id, { username: body.username, firstName: body['first-name'], lastName: body['last-name'], enabled: body.enabled });
    return updatedUser;
  }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Atualiza a senha do usuário' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: PatchPasswordDto })
  @ApiResponse({ status: 200, description: 'Senha atualizada.' })
  @ApiResponse({ status: 400, description: 'Erro na estrutura da chamada.' })
  @ApiResponse({ status: 401, description: 'Access token inválido.' })
  @ApiResponse({ status: 403, description: 'Access token não concede permissão.' })
  @ApiResponse({ status: 404, description: 'Usuário não localizado.' })
  @ApiBearerAuth()
  async patchPassword(@AuthToken() token: string, @Param('id') id: string, @Body() body: PatchPasswordDto) {
    const updatedPassword = await this.usersService.patchPassword(token, id, body.password);
    return updatedPassword;
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Desabilita um usuário' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 204, description: 'Usuário desabilitado.' })
  @ApiResponse({ status: 400, description: 'Erro na estrutura da chamada.' })
  @ApiResponse({ status: 401, description: 'Access token inválido.' })
  @ApiResponse({ status: 403, description: 'Access token não concede permissão.' })
  @ApiResponse({ status: 404, description: 'Usuário não localizado.' })
  @ApiBearerAuth()
  async disableUser(@AuthToken() token: string, @Param('id') id: string, @Res() res: Response) {
    await this.usersService.disableUser(token, id);
    return res.status(HttpStatus.NO_CONTENT).send();
  }

  @Get('users/:id/roles')
  @ApiOperation({ summary: 'Obtém as roles de um usuário' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Roles do usuário obtidas com sucesso.' })
  @ApiResponse({ status: 400, description: 'Erro na estrutura da chamada.' })
  @ApiResponse({ status: 401, description: 'Access token inválido.' })
  @ApiResponse({ status: 403, description: 'Access token não concede permissão.' })
  @ApiResponse({ status: 404, description: 'Usuário não localizado.' })
  @ApiBearerAuth()
  async getUserRoles(@AuthToken() token: string, @Param('id') id: string) {
    return await this.usersService.getUserRoles(token, id);
  }
}
