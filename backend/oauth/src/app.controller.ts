import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('health')
export class AppController {
  @Get()
  @ApiOperation({ summary: 'Verifica o status do serviço' })
  @ApiResponse({ status: 200, description: 'Serviço está funcionando corretamente.' })
  checkHealth() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}