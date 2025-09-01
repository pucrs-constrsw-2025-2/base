import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({
    description: 'Token de acesso JWT para autenticação.',
    example: 'eyJhb...',
  })
  access_token: string;

  @ApiProperty({
    description: 'Tempo de vida do token de acesso em segundos.',
    example: 3600,
  })
  expires_in: number;

  @ApiProperty({
    description: 'Tempo de vida do refresh token em segundos.',
    example: 7200,
  })
  refresh_expires_in: number;

  @ApiProperty({
    description: 'Token para renovar a sessão sem precisar de novas credenciais.',
    example: 'eyJhb...',
  })
  refresh_token: string;

  @ApiProperty({
    description: 'Tipo do token.',
    example: 'Bearer',
  })
  token_type: string;

  @ApiProperty({
    description: 'Política "not-before", indica que o token não é válido antes deste timestamp.',
    example: 0,
  })
  'not-before-policy': number;

  @ApiProperty({
    description: 'Identificador único da sessão do usuário.',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  session_state: string;

  @ApiProperty({
    description: 'Escopos de permissão associados ao token.',
    example: 'openid profile email',
  })
  scope: string;
}