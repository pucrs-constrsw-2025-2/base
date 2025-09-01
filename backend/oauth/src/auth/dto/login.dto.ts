import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Nome de usuário ou e-mail para login',
    example: 'johndoe',
  })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'password123',
    format: 'password', 
  })
  @IsString()
  @IsNotEmpty()
  password!: string;
}