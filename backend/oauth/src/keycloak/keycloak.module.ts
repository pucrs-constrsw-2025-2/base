import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { KeycloakAdapter } from './adapter/keycloak.adapter';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [
    {
      provide: 'IKeycloakAdapter',
      useClass: KeycloakAdapter,
    },
  ],
  exports: ['IKeycloakAdapter'],
})
export class KeycloakModule {}
