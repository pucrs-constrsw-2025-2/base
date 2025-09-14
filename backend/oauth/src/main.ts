// oauth/src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.setGlobalPrefix('api');

  // --- CONFIGURAÇÃO DO SWAGGER ---
  const config = new DocumentBuilder()
    .setTitle('Closed CRAS - OAuth API')
    .setDescription(
      `API REST do backend da aplicação Closed CRAS. 
      
      Esta API atua como um gateway seguro para o Keycloak, abstraindo a complexidade e fornecendo endpoints simplificados para as seguintes operações:
      - Autenticação de usuários (Login)
      - Gerenciamento completo de Usuários (CRUD)
      - Gerenciamento completo de Roles (CRUD)
      - Associação de Roles a Usuários`,
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  // ==========================================================
  // HABILITA O CORS PARA PERMITIR CHAMADAS DO FRONTEND
  // ==========================================================
  app.enableCors();
  // ==========================================================
  
  // Usa a variável de ambiente PORTA, ou 3000 como padrão
  const port = process.env.OAUTH_PORT || 3000;
  await app.listen(port);
}

// Chama a função para iniciar a aplicação
bootstrap();