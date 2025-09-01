import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RoleDto {
  @ApiPropertyOptional({
    description: 'O ID único da role (gerado pelo Keycloak).',
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  })
  id?: string;

  @ApiProperty({
    description: 'O nome único da role.',
    example: 'gerente-de-vendas',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'A descrição da responsabilidade da role.',
    example: 'Pode visualizar e gerenciar relatórios de vendas.',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Indica se a role é composta (agrupa outras roles).',
    example: false,
  })
  composite?: boolean;

  @ApiPropertyOptional({
    description: 'Indica se a role pertence a um cliente específico (client role).',
    example: false,
  })
  clientRole?: boolean;

  @ApiPropertyOptional({
    description: 'O ID do container ou cliente ao qual a role pode estar associada.',
    example: 'realm-name',
  })
  containerId?: string;
}