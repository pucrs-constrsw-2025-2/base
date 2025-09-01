import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({
    description: 'O ID único do usuário (UUID).',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  id: string;

  @ApiProperty({
    description: 'O nome de usuário para login.',
    example: 'maria.freire',
  })
  username: string;

  @ApiPropertyOptional({
    description: 'O e-mail do usuário.',
    example: 'maria.freire@example.com',
  })
  email?: string;

  @ApiPropertyOptional({
    description: 'O primeiro nome do usuário.',
    example: 'Mariah',
  })
  firstName?: string;

  @ApiPropertyOptional({
    description: 'O sobrenome do usuário.',
    example: 'Freire',
  })
  lastName?: string;

  @ApiProperty({
    description: 'Indica se a conta do usuário está ativa.',
    example: true,
  })
  enabled: boolean;

  @ApiProperty({
    description: 'Indica se o e-mail do usuário foi verificado.',
    example: false,
  })
  emailVerified: boolean;

  @ApiProperty({
    description: 'Timestamp Unix de quando o usuário foi criado.',
    example: 1672531200000,
  })
  createdTimestamp: number;
}