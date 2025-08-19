import 'dotenv/config';
import { Controller, Post, Body, HttpCode, HttpStatus, Headers, Get, Query, Param, Put, Patch, Delete, Res, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { LoginDto } from './dtos/login.dto';
import type { Response } from 'express';
import type { CreateUserDto } from './dtos/create-user.dto';
import type { UpdateUserDto } from './dtos/update-user.dto';
import type { PatchPasswordDto } from './dtos/patch-password.dto';

@Controller('')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseInterceptors(FileFieldsInterceptor([]))
  @Post('login')
  @HttpCode(201)
  async login(@Body() body: any) {
    const username = body.username || body['username'];
    const password = body.password || body['password'];
    const token = await this.usersService.login(username, password);
    return {
      token_type: token.token_type,
      access_token: token.access_token,
      expires_in: token.expires_in,
      refresh_token: token.refresh_token,
      refresh_expires_in: token.refresh_expires_in,
    };
  }

  @Post('users')
  async createUser(@Headers('authorization') authorization: string, @Body() body: CreateUserDto, @Res() res: Response) {
    const token = authorization?.split(' ')[1];
    const created = await this.usersService.createUser(token, { username: body.username, password: body.password, firstName: body['first-name'], lastName: body['last-name'] });
    return res.status(HttpStatus.CREATED).json(created);
  }

  @Get('users')
  async getUsers(@Headers('authorization') authorization: string, @Query('enabled') enabled?: string) {
    const token = authorization?.split(' ')[1];
    return await this.usersService.getUsers(token, enabled);
  }

  @Get('users/:id')
  async getUser(@Headers('authorization') authorization: string, @Param('id') id: string) {
    const token = authorization?.split(' ')[1];
    return await this.usersService.getUserById(token, id);
  }

  @Put('users/:id')
  async updateUser(@Headers('authorization') authorization: string, @Param('id') id: string, @Body() body: UpdateUserDto) {
    const token = authorization?.split(' ')[1];
    await this.usersService.updateUser(token, id, { username: body.username, firstName: body['first-name'], lastName: body['last-name'], enabled: body.enabled });
    return { };
  }

  @Patch('users/:id')
  async patchPassword(@Headers('authorization') authorization: string, @Param('id') id: string, @Body() body: PatchPasswordDto) {
    const token = authorization?.split(' ')[1];
    await this.usersService.patchPassword(token, id, body.password);
    return { };
  }

  @Delete('users/:id')
  async disableUser(@Headers('authorization') authorization: string, @Param('id') id: string, @Res() res: Response) {
    const token = authorization?.split(' ')[1];
    await this.usersService.disableUser(token, id);
    return res.status(HttpStatus.NO_CONTENT).send();
  }
}
