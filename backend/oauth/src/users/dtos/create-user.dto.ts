
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'user@email.com',
    description: 'E-mail do usuário (username)',
    pattern: "([-!#-'*+/-9=?A-Z^-~]+(\\.[-!#-'*+/-9=?A-Z^-~]+)*|\"([]!#-[^-~ \\t]|(\\\\(\\t -~]))+\")@([-!#-'*+/-9=?A-Z^-~]+(\\.[-!#-'*+/-9=?A-Z^-~]+)*|\\([\\t -Z^-~]*])"
  })
  username!: string;

  @ApiProperty({ example: 'senha123', description: 'Senha do usuário (plain text)' })
  password!: string;

  @ApiProperty({ example: 'João', description: 'Primeiro nome do usuário', required: false })
  'first-name'?: string;

  @ApiProperty({ example: 'Silva', description: 'Último nome do usuário', required: false })
  'last-name'?: string;
}
