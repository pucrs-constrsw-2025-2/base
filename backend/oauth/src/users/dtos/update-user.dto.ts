
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ example: 'user@email.com', description: 'E-mail do usuário (username)', required: false })
  username?: string;

  @ApiProperty({ example: 'João', description: 'Primeiro nome do usuário', required: false })
  'first-name'?: string;

  @ApiProperty({ example: 'Silva', description: 'Último nome do usuário', required: false })
  'last-name'?: string;

  @ApiProperty({ example: true, description: 'Usuário habilitado', required: false })
  enabled?: boolean;
}
