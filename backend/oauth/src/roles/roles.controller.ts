import { Controller, Post, Body, Headers, Get, Param, Put, Delete, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { RolesService } from './roles.service';
import type { Response } from 'express';

@ApiTags('roles')
@ApiBearerAuth()
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma nova role' })
  @ApiBody({ schema: { properties: { name: { type: 'string' }, description: { type: 'string' } } } })
  @ApiResponse({ status: 201, description: 'Role criada com sucesso.' })
  @ApiResponse({ status: 400, description: 'Erro na estrutura da chamada.' })
  @ApiResponse({ status: 401, description: 'Access token inválido.' })
  @ApiResponse({ status: 403, description: 'Access token não concede permissão.' })
  @ApiResponse({ status: 409, description: 'Role já existente.' })
  async create(@Headers('authorization') authorization: string, @Body() body: any, @Res() res: Response) {
    const token = authorization?.split(' ')[1];
    const created = await this.rolesService.createRole(token, { name: body.name, description: body.description });
    return res.status(HttpStatus.CREATED).json(created);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todas as roles' })
  @ApiResponse({ status: 200, description: 'Lista de roles.' })
  @ApiResponse({ status: 400, description: 'Erro na estrutura do request.' })
  @ApiResponse({ status: 401, description: 'Access token inválido.' })
  @ApiResponse({ status: 403, description: 'Access token não concede permissão.' })
  async getAll(@Headers('authorization') authorization: string) {
    const token = authorization?.split(' ')[1];
    return await this.rolesService.getRoles(token);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca uma role pelo ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Role encontrada.' })
  @ApiResponse({ status: 400, description: 'Erro na estrutura da chamada.' })
  @ApiResponse({ status: 401, description: 'Access token inválido.' })
  @ApiResponse({ status: 403, description: 'Access token não concede permissão.' })
  @ApiResponse({ status: 404, description: 'Role não localizada.' })
  async get(@Headers('authorization') authorization: string, @Param('id') id: string) {
    const token = authorization?.split(' ')[1];
    return await this.rolesService.getRoleById(token, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Atualiza uma role' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ schema: { properties: { name: { type: 'string' }, description: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Role atualizada.' })
  @ApiResponse({ status: 400, description: 'Erro na estrutura da chamada.' })
  @ApiResponse({ status: 401, description: 'Access token inválido.' })
  @ApiResponse({ status: 403, description: 'Access token não concede permissão.' })
  @ApiResponse({ status: 404, description: 'Role não localizada.' })
  async update(@Headers('authorization') authorization: string, @Param('id') id: string, @Body() body: any) {
    const token = authorization?.split(' ')[1];
    await this.rolesService.updateRole(token, id, body);
    return {};
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove uma role' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Role removida.' })
  @ApiResponse({ status: 400, description: 'Erro na estrutura da chamada.' })
  @ApiResponse({ status: 401, description: 'Access token inválido.' })
  @ApiResponse({ status: 403, description: 'Access token não concede permissão.' })
  @ApiResponse({ status: 404, description: 'Role não localizada.' })
  async delete(@Headers('authorization') authorization: string, @Param('id') id: string) {
    const token = authorization?.split(' ')[1];
    await this.rolesService.deleteRole(token, id);
    return {};
  }

  @Post(':id/users/:userId')
  @ApiOperation({ summary: 'Adiciona uma role a um usuário' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'userId', type: String })
  @ApiResponse({ status: 200, description: 'Role adicionada ao usuário.' })
  @ApiResponse({ status: 400, description: 'Erro na estrutura da chamada.' })
  @ApiResponse({ status: 401, description: 'Access token inválido.' })
  @ApiResponse({ status: 403, description: 'Access token não concede permissão.' })
  @ApiResponse({ status: 404, description: 'Usuário ou role não localizado.' })
  async addToUser(@Headers('authorization') authorization: string, @Param('id') id: string, @Param('userId') userId: string) {
    const token = authorization?.split(' ')[1];
    await this.rolesService.addRoleToUser(token, userId, id);
    return {};
  }

  @Delete(':id/users/:userId')
  @ApiOperation({ summary: 'Remove uma role de um usuário' })
  @ApiParam({ name: 'id', type: String })
  @ApiParam({ name: 'userId', type: String })
  @ApiResponse({ status: 200, description: 'Role removida do usuário.' })
  @ApiResponse({ status: 400, description: 'Erro na estrutura da chamada.' })
  @ApiResponse({ status: 401, description: 'Access token inválido.' })
  @ApiResponse({ status: 403, description: 'Access token não concede permissão.' })
  @ApiResponse({ status: 404, description: 'Usuário ou role não localizado.' })
  async removeFromUser(@Headers('authorization') authorization: string, @Param('id') id: string, @Param('userId') userId: string) {
    const token = authorization?.split(' ')[1];
    await this.rolesService.removeRoleFromUser(token, userId, id);
    return {};
  }
}
