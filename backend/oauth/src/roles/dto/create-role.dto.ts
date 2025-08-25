import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  composite?: boolean;

  @IsOptional()
  @IsBoolean()
  clientRole?: boolean;
}
