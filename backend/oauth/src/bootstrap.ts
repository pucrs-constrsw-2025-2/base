import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new HttpExceptionFilter());

  // --- INÍCIO DA CONFIGURAÇÃO DO SWAGGER ---
  console.log('--- EXECUTANDO A CONFIGURAÇÃO DO SWAGGER ---');
  // 1. Crie a configuração base com DocumentBuilder
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
    .addBearerAuth() // Essencial para APIs que usam autenticação JWT
    .build();

  // 2. Crie o documento OpenAPI completo
  const document = SwaggerModule.createDocument(app, config);

  // 3. Configure a rota e inicie a interface do Swagger
  // A UI ficará disponível em /api (ex: http://localhost:3001/api)
  SwaggerModule.setup('api', app, document);

  // --- FIM DA CONFIGURAÇÃO DO SWAGGER ---

  await app.listen(process.env.PORT ?? 3000);
}