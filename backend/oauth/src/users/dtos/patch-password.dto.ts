
import { ApiProperty } from '@nestjs/swagger';

export class PatchPasswordDto {
  @ApiProperty({ example: 'novaSenha123', description: 'Nova senha do usuário' })
  password!: string;
}
