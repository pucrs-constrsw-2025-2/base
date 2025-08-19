import { Module } from '@nestjs/common';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { RolesController } from './roles/roles.controller';
import { RolesService } from './roles/roles.service';

@Module({
  imports: [],
  controllers: [UsersController, RolesController],
  providers: [UsersService, RolesService],
})
export class AppModule {}
