
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ example: 'admin', description: 'Nome do papel (role)' })
  name!: string;

  @ApiProperty({ example: 'Administrador do sistema', description: 'Descrição do papel', required: false })
  description?: string;
}
