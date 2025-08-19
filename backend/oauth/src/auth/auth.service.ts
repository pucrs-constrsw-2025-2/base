import { Inject, Injectable } from '@nestjs/common';
import type { IKeycloakAdapter } from 'src/keycloak/adapter/keycloak.adapter.interface';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject('IKeycloakAdapter')
    private readonly keycloakAdapter: IKeycloakAdapter,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.keycloakAdapter.login(loginDto);
  }
}
