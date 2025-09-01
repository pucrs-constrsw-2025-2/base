import { AuthGuard } from './auth.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { IKeycloakAdapter } from 'src/keycloak/adapter/keycloak.adapter.interface';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let reflector: Reflector;
  let keycloakAdapter: IKeycloakAdapter;

  beforeEach(() => {
    reflector = new Reflector();
    keycloakAdapter = {
      validateToken: jest.fn(),
    } as unknown as IKeycloakAdapter;
    guard = new AuthGuard(reflector, keycloakAdapter);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access to public routes', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;

    const canActivate = await guard.canActivate(context);

    expect(canActivate).toBe(true);
  });

  it('should throw UnauthorizedException if no token is provided', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ headers: {} }),
      }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if token is invalid', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    jest.spyOn(keycloakAdapter, 'validateToken').mockResolvedValue(false);
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ headers: { authorization: 'Bearer invalid-token' } }),
      }),
    } as unknown as ExecutionContext;

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('should allow access if token is valid', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    jest.spyOn(keycloakAdapter, 'validateToken').mockResolvedValue(true);
    const context = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ headers: { authorization: 'Bearer valid-token' } }),
      }),
    } as unknown as ExecutionContext;

    const canActivate = await guard.canActivate(context);

    expect(canActivate).toBe(true);
  });

  describe('extractTokenFromHeader', () => {
    it('should return undefined if no authorization header', () => {
      const request = { headers: {} } as any;
      expect((guard as any).extractTokenFromHeader(request)).toBeUndefined();
    });

    it('should return undefined if not a Bearer token', () => {
      const request = { headers: { authorization: 'Basic token' } } as any;
      expect((guard as any).extractTokenFromHeader(request)).toBeUndefined();
    });

    it('should return token if it is a Bearer token', () => {
      const request = { headers: { authorization: 'Bearer my-token' } } as any;
      expect((guard as any).extractTokenFromHeader(request)).toEqual('my-token');
    });
  });
});
