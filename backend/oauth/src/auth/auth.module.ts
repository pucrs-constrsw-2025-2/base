import { Module } from '@nestjs/common';
import { KeycloakModule } from 'src/keycloak/keycloak.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [KeycloakModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
