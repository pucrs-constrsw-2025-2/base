
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@email.com', description: 'E-mail do usuário' })
  username!: string;

  @ApiProperty({ example: 'senha123', description: 'Senha do usuário' })
  password!: string;
}
