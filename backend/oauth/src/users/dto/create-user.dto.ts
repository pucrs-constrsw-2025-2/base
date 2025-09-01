import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'O nome de usuário único para login.',
    example: 'maria.freire',
  })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({
    description: 'O e-mail do usuário.',
    example: 'maria.freire@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    description: 'O primeiro nome do usuário.',
    example: 'Mariah',
  })
  @IsString()
  @IsNotEmpty()
  firstName!: string;

  @ApiProperty({
    description: 'O sobrenome do usuário.',
    example: 'Freire',
  })
  @IsString()
  @IsNotEmpty()
  lastName!: string;

  @ApiProperty({
    description: 'A senha do usuário. Deve ter no mínimo 8 caracteres.',
    example: 'senhaSegura123',
    minLength: 8,
    format: 'password', // Melhora a UI do Swagger para campos de senha
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;
}