import { IsString, IsDateString, IsOptional, MaxLength, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuthorizedUserDto {
  @ApiProperty({ type: 'string', format: 'uuid', description: 'Identificador do usuário autorizado' })
  @IsString()
  user_id: string;

  @ApiProperty({ type: 'string', maxLength: 100, description: 'Nome do usuário autorizado' })
  @IsString()
  @MaxLength(100)
  name: string;
}

export class CreateReservationDto {
  @ApiProperty({ type: 'string', format: 'date', description: 'Data de início da reserva (YYYY-MM-DD)' })
  @IsDateString()
  initial_date: string;

  @ApiProperty({ type: 'string', format: 'date', description: 'Data de término da reserva (YYYY-MM-DD)' })
  @IsDateString()
  end_date: string;

  @ApiPropertyOptional({ type: 'string', maxLength: 1000, description: 'Detalhes adicionais da reserva' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  details?: string;

  @ApiPropertyOptional({ type: [AuthorizedUserDto], description: 'Lista de usuários autorizados a acessar a reserva' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AuthorizedUserDto)
  authorizedUsers?: AuthorizedUserDto[];
}
