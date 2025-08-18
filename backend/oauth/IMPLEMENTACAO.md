# Implementação Completa da API OAuth - Grupo 6

## Resumo do Projeto

Esta implementação cria uma API REST completa em Spring Boot que consome a API REST do Keycloak para autenticação e gerenciamento de usuários e roles, conforme especificado nos requisitos do projeto.

## Estrutura da Implementação

### 1. Arquivos Principais Criados/Modificados

#### Configuração Base
- **`pom.xml`** - Atualizado com dependências Spring Boot Web, WebFlux e Jackson
- **`application.properties`** - Configurado com variáveis do Keycloak
- **`Dockerfile`** - Container para a aplicação Spring Boot
- **`docker-compose.yml`** - Adicionado serviço oauth com dependência do Keycloak

#### DTOs (Data Transfer Objects)
- **`AuthRequest.java`** - Request para autenticação (username, password)
- **`AuthResponse.java`** - Response da autenticação (tokens)
- **`UserRequest.java`** - Request para criação/atualização de usuário
- **`UserResponse.java`** - Response com dados do usuário
- **`RoleRequest.java`** - Request para criação/atualização de role
- **`RoleResponse.java`** - Response com dados do role
- **`PasswordUpdateRequest.java`** - Request para atualização de senha
- **`ApiError.java`** - Estrutura padronizada de erros

#### Serviços
- **`KeycloakService.java`** - Serviço que consome toda a API REST do Keycloak

#### Controllers
- **`AuthController.java`** - Endpoint de login
- **`UserController.java`** - CRUD completo de usuários
- **`RoleController.java`** - CRUD completo de roles + atribuição de roles

#### Tratamento de Erros
- **`GlobalExceptionHandler.java`** - Tratamento global de exceções

#### Documentação
- **`README.md`** - Documentação completa da API

## 2. Endpoints Implementados

### Autenticação
- `POST /login` - Autenticação com username/password

### Usuários
- `POST /users` - Criar usuário
- `GET /users` - Listar usuários (com filtro opcional `enabled`)
- `GET /users/{id}` - Buscar usuário por ID
- `PUT /users/{id}` - Atualizar usuário
- `PATCH /users/{id}` - Atualizar senha
- `DELETE /users/{id}` - Exclusão lógica (desabilitar)

### Roles
- `POST /roles` - Criar role
- `GET /roles` - Listar roles
- `GET /roles/{id}` - Buscar role por ID/nome
- `PUT /roles/{id}` - Atualizar role
- `PATCH /roles/{id}` - Atualização parcial de role
- `DELETE /roles/{id}` - Excluir role

### Atribuição de Roles
- `POST /roles/assign/{userId}/{roleName}` - Atribuir role a usuário
- `DELETE /roles/unassign/{userId}/{roleName}` - Remover role de usuário

## 3. Características Técnicas

### Validações Implementadas
- ✅ Validação de e-mail (regex simplificada)
- ✅ Validação de campos obrigatórios
- ✅ Validação de tokens de autorização

### Tratamento de Erros
- ✅ Estrutura padronizada de erro conforme especificação
- ✅ Códigos de erro apropriados (400, 401, 403, 404, 409, 500)
- ✅ Mensagens descritivas de erro
- ✅ Source identificado como "OAuthAPI"

### Integração com Keycloak
- ✅ Autenticação via client credentials
- ✅ Gerenciamento de usuários via Admin REST API
- ✅ Gerenciamento de roles
- ✅ Atribuição/remoção de roles de usuários

### Configuração
- ✅ Variáveis de ambiente configuradas no `.env`
- ✅ Configuração flexível para ambiente interno (Docker) e externo
- ✅ Porta 8082 para a API OAuth

## 4. Como Usar

### Pré-requisitos
1. Docker e Docker Compose instalados
2. Arquivo `.env` configurado (já está)

### Executar
```bash
# Criar volume do Keycloak
docker volume create constrsw-keycloak-data

# Iniciar serviços
docker-compose up -d
```

### Acessos
- **API OAuth**: http://localhost:8082
- **Keycloak Console**: http://localhost:8001
  - Admin: admin / a12345678
  - Realm: constrsw

### Exemplo de Uso

1. **Login** (para obter token):
```bash
curl -X POST http://localhost:8082/login \
  -H "Content-Type: multipart/form-data" \
  -F "username=admin" \
  -F "password=admin"
```

2. **Criar usuário**:
```bash
curl -X POST http://localhost:8082/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {access_token}" \
  -d '{
    "username": "user@example.com",
    "password": "senha123",
    "firstName": "João",
    "lastName": "Silva"
  }'
```

## 5. Configurações do Keycloak

O projeto está configurado para usar:
- **Realm**: constrsw
- **Client ID**: oauth
- **Client Secret**: wsNXUxaupU9X6jCncsn3rOEy6PDt7oJO
- **Grant Type**: password

## 6. Características Avançadas

### Filtros Implementados
- Filtro de usuários por status (enabled/disabled)

### Flexibilidade
- Suporte tanto para comunicação interna (Docker) quanto externa
- Configuração via variáveis de ambiente
- Tratamento robusto de erros

### Segurança
- Validação de tokens em todos os endpoints protegidos
- Validação de formato de e-mail
- Extração segura de tokens Bearer

## 7. Status da Implementação

✅ **CONCLUÍDO**: Todos os requisitos especificados foram implementados:

1. ✅ API REST com Spring Boot
2. ✅ Integração completa com Keycloak
3. ✅ Todos os endpoints de usuários especificados
4. ✅ Todos os endpoints de roles especificados
5. ✅ Tratamento de erros conforme especificação
6. ✅ Dockerfile e integração com docker-compose
7. ✅ Documentação completa
8. ✅ Configuração via variáveis de ambiente
9. ✅ Estrutura de projeto organizada

A API está pronta para uso e teste com Postman ou qualquer cliente HTTP, seguindo exatamente as especificações fornecidas no enunciado do projeto.
