import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    description: 'O nome único da role (ex: "admin").',
    example: 'gerente',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Uma breve descrição da responsabilidade da role.',
    example: 'Pode gerenciar usuários e relatórios.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Indica se a role é composta (agrupa outras roles).',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  composite?: boolean;

  @ApiPropertyOptional({
    description: 'Indica se a role pertence a um cliente específico (client role).',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  clientRole?: boolean;
}