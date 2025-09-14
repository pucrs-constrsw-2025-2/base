import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginResponseDto } from './dto/login-response.dto';

@ApiTags('Auth') // 2. Agrupe todos os endpoints sob a tag "Auth"
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Realiza o login do usuário' }) // 3. Descreva o endpoint
  @ApiResponse({
    status: 200,
    description: 'Login bem-sucedido. Retorna os tokens de acesso.',
    type: LoginResponseDto, // 4. Descreva a resposta de sucesso
  })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas.' }) // 5. Descreva a resposta de erro
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
