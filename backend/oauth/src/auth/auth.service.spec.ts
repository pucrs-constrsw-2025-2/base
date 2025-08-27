import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import type { IKeycloakAdapter } from 'src/keycloak/adapter/keycloak.adapter.interface';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';

const mockKeycloakAdapter: Partial<IKeycloakAdapter> = {
  login: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;
  let keycloakAdapter: IKeycloakAdapter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: 'IKeycloakAdapter',
          useValue: mockKeycloakAdapter,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    keycloakAdapter = module.get<IKeycloakAdapter>('IKeycloakAdapter');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should call keycloakAdapter.login and return the result', async () => {
      const loginDto: LoginDto = {
        username: 'testuser',
        password: 'password',
      };
      const expectedResult: LoginResponseDto = {
        access_token: 'some-access-token',
        expires_in: 300,
        refresh_expires_in: 1800,
        refresh_token: 'some-refresh-token',
        token_type: 'Bearer',
        'not-before-policy': 0,
        session_state: 'some-session-state',
        scope: 'openid profile email',
      };
      (keycloakAdapter.login as jest.Mock).mockResolvedValue(expectedResult);

      const result = await service.login(loginDto);

      expect(keycloakAdapter.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(expectedResult);
    });
  });
});
