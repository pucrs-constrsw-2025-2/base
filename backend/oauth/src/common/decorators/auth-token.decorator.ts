import { createParamDecorator, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';

export const AuthToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const token = request.headers['authorization']?.split(' ')[1];
    if(!token) {
        throw new HttpException({ error_code: String(HttpStatus.UNAUTHORIZED), error_description: "User not authorized", error_source: 'OAuthAPI' }, HttpStatus.UNAUTHORIZED);
    }
    return token;
  },
);