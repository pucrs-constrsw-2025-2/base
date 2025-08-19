import { Controller, Post, Body, Headers, Get, Param, Put, Patch, Delete, HttpStatus, Res } from '@nestjs/common';
import { RolesService } from './roles.service';
import type { Response } from 'express';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  async create(@Headers('authorization') authorization: string, @Body() body: any, @Res() res: Response) {
    const token = authorization?.split(' ')[1];
    const created = await this.rolesService.createRole(token, { name: body.name, description: body.description });
    return res.status(HttpStatus.CREATED).json(created);
  }

  @Get()
  async getAll(@Headers('authorization') authorization: string) {
    const token = authorization?.split(' ')[1];
    return await this.rolesService.getRoles(token);
  }

  @Get(':id')
  async get(@Headers('authorization') authorization: string, @Param('id') id: string) {
    const token = authorization?.split(' ')[1];
    return await this.rolesService.getRoleById(token, id);
  }

  @Put(':id')
  async update(@Headers('authorization') authorization: string, @Param('id') id: string, @Body() body: any) {
    const token = authorization?.split(' ')[1];
    await this.rolesService.updateRole(token, id, body);
    return {};
  }

  @Delete(':id')
  async delete(@Headers('authorization') authorization: string, @Param('id') id: string) {
    const token = authorization?.split(' ')[1];
    await this.rolesService.deleteRole(token, id);
    return {};
  }

  @Post(':id/users/:userId')
  async addToUser(@Headers('authorization') authorization: string, @Param('id') id: string, @Param('userId') userId: string) {
    const token = authorization?.split(' ')[1];
    await this.rolesService.addRoleToUser(token, userId, id);
    return {};
  }

  @Delete(':id/users/:userId')
  async removeFromUser(@Headers('authorization') authorization: string, @Param('id') id: string, @Param('userId') userId: string) {
    const token = authorization?.split(' ')[1];
    await this.rolesService.removeRoleFromUser(token, userId, id);
    return {};
  }
}
