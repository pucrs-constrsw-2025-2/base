# Módulo de Roles

Este módulo implementa a gestão completa de roles (papéis) para a API Gateway, abstraindo a complexidade do Keycloak e fornecendo endpoints simplificados.

## 🏗️ Estrutura do Módulo

```
roles/
├── dto/
│   ├── role.dto.ts           # DTO principal para Role
│   ├── create-role.dto.ts    # DTO para criação de roles
│   └── update-role.dto.ts    # DTO para atualização de roles
├── roles.service.ts           # Lógica de negócio
├── roles.controller.ts        # Endpoints da API
├── roles.module.ts           # Configuração do módulo
└── README.md                 # Esta documentação
```

## 🔑 Endpoints Disponíveis

### 1. Criar Role

```http
POST /roles
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "name": "admin",
  "description": "Administrador do sistema",
  "composite": false,
  "clientRole": true
}
```

### 2. Listar Todas as Roles

```http
GET /roles
Authorization: Bearer {{access_token}}
```

### 3. Buscar Role por Nome

```http
GET /roles/{{role_name}}
Authorization: Bearer {{access_token}}
```

### 4. Atualizar Role

```http
PATCH /roles/{{role_name}}
Authorization: Bearer {{access_token}}
Content-Type: application/json

{
  "description": "Administrador com privilégios elevados"
}
```

### 5. Deletar Role

```http
DELETE /roles/{{role_name}}
Authorization: Bearer {{access_token}}
```

### 6. Atribuir Role ao Usuário

```http
POST /roles/{{role_name}}/users/{{user_id}}
Authorization: Bearer {{access_token}}
```

### 7. Remover Role do Usuário

```http
DELETE /roles/{{role_name}}/users/{{user_id}}
Authorization: Bearer {{access_token}}
```

## 🔧 Configuração

O módulo utiliza as seguintes variáveis de ambiente:

- `KEYCLOAK_INTERNAL_PROTOCOL`: Protocolo para conexão com Keycloak
- `KEYCLOAK_INTERNAL_HOST`: Host do Keycloak
- `KEYCLOAK_INTERNAL_API_PORT`: Porta da API do Keycloak
- `KEYCLOAK_REALM`: Realm do Keycloak
- `KEYCLOAK_CLIENT_ID`: ID do cliente Keycloak
- `KEYCLOAK_CLIENT_SECRET`: Secret do cliente Keycloak
- `KEYCLOAK_ADMIN_USERNAME`: Usuário admin do Keycloak
- `KEYCLOAK_ADMIN_PASSWORD`: Senha do admin do Keycloak

## 🧪 Testes

Execute os testes com:

```bash
# Testes unitários
npm run test roles

# Testes com cobertura
npm run test:cov roles

# Testes e2e
npm run test:e2e
```

## 📝 DTOs

### RoleDto

```typescript
export class RoleDto {
  id?: string;
  name: string;
  description?: string;
  composite?: boolean;
  clientRole?: boolean;
  containerId?: string;
  attributes?: Record<string, any>;
}
```

### CreateRoleDto

```typescript
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
```

### UpdateRoleDto

```typescript
export class UpdateRoleDto extends PartialType(CreateRoleDto) {}
```

## 🔄 Fluxo de Dados

1. **Controller** recebe a requisição HTTP
2. **Service** processa a lógica de negócio
3. **KeycloakAdapter** traduz para a API do Keycloak
4. **Keycloak** processa a operação
5. **Resposta** retorna através da cadeia

## 🚀 Integração

O módulo está integrado ao `AppModule` e utiliza o `KeycloakModule` para comunicação com o Keycloak. Todas as rotas são protegidas pelo `AuthGuard` e requerem um token de acesso válido.

## 📚 Dependências

- `@nestjs/common`: Framework NestJS
- `@nestjs/axios`: Cliente HTTP
- `class-validator`: Validação de DTOs
- `@nestjs/mapped-types`: Utilitários para tipos
