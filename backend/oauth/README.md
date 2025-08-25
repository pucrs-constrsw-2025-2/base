# OAuth API - Spring Boot

API REST que consome a API REST do Keycloak para autenticação e gerenciamento de usuários e roles.

## Configuração

### Variáveis de Ambiente

### Executar com Docker

1. Criar o volume do Keycloak:
```bash
docker volume create constrsw-keycloak-data
```

2. Executar os serviços:
```bash
docker-compose up -d
```

A API estará disponível em: `http://localhost:8082`
O Keycloak estará disponível em: `http://localhost:8001`

## Endpoints

### Autenticação

#### POST /login
Autenticação de usuário

**Request:**
- Content-Type: `multipart/form-data`
- Body:
  - `username`: string
  - `password`: string

**Response (201):**
```json
{
  "token_type": "Bearer",
  "access_token": "...",
  "expires_in": 300,
  "refresh_token": "...",
  "refresh_expires_in": 1800
}
```

### Usuários

#### POST /users
Criação de usuário

**Headers:**
- `Authorization: Bearer {access_token}`

**Request Body:**
```json
{
  "username": "user@example.com",
  "password": "senha123",
  "firstName": "João",
  "lastName": "Silva"
}
```

**Response (201):**
```json
{
  "id": "uuid-generated",
  "username": "user@example.com",
  "firstName": "João",
  "lastName": "Silva",
  "enabled": true
}
```

#### GET /users
Recuperação de todos os usuários

**Headers:**
- `Authorization: Bearer {access_token}`

**Query Parameters:**
- `enabled`: boolean (opcional) - filtrar por status habilitado

**Response (200):**
```json
[
  {
    "id": "uuid",
    "username": "user@example.com",
    "firstName": "João",
    "lastName": "Silva",
    "enabled": true
  }
]
```

#### GET /users/{id}
Recuperação de usuário por ID

**Headers:**
- `Authorization: Bearer {access_token}`

**Response (200):**
```json
{
  "id": "uuid",
  "username": "user@example.com",
  "firstName": "João",
  "lastName": "Silva",
  "enabled": true
}
```

#### PUT /users/{id}
Atualização de usuário

**Headers:**
- `Authorization: Bearer {access_token}`

**Request Body:**
```json
{
  "username": "newemail@example.com",
  "firstName": "João Carlos",
  "lastName": "Silva Santos"
}
```

**Response (200):** Vazio

#### PATCH /users/{id}
Atualização de senha

**Headers:**
- `Authorization: Bearer {access_token}`

**Request Body:**
```json
{
  "password": "novaSenha123"
}
```

**Response (200):** Vazio

#### DELETE /users/{id}
Exclusão lógica (desabilitação) de usuário

**Headers:**
- `Authorization: Bearer {access_token}`

**Response (204):** Vazio

### Roles

#### POST /roles
Criação de role

**Headers:**
- `Authorization: Bearer {access_token}`

**Request Body:**
```json
{
  "name": "admin",
  "description": "Administrador do sistema"
}
```

**Response (201):**
```json
{
  "id": null,
  "name": "admin",
  "description": "Administrador do sistema",
  "enabled": true
}
```

#### GET /roles
Recuperação de todos os roles

**Headers:**
- `Authorization: Bearer {access_token}`

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "admin",
    "description": "Administrador do sistema",
    "enabled": true
  }
]
```

#### GET /roles/{id}
Recuperação de role por nome/ID

**Headers:**
- `Authorization: Bearer {access_token}`

**Response (200):**
```json
{
  "id": "uuid",
  "name": "admin",
  "description": "Administrador do sistema",
  "enabled": true
}
```

#### PUT /roles/{id}
Atualização de role

**Headers:**
- `Authorization: Bearer {access_token}`

**Request Body:**
```json
{
  "name": "admin",
  "description": "Nova descrição"
}
```

**Response (200):** Vazio

#### PATCH /roles/{id}
Atualização parcial de role

**Headers:**
- `Authorization: Bearer {access_token}`

**Request Body:**
```json
{
  "description": "Nova descrição"
}
```

**Response (200):** Vazio

#### DELETE /roles/{id}
Exclusão de role

**Headers:**
- `Authorization: Bearer {access_token}`

**Response (204):** Vazio

### Atribuição de Roles

#### POST /roles/assign/{userId}/{roleName}
Atribuir role a usuário

**Headers:**
- `Authorization: Bearer {access_token}`

**Response (200):** Vazio

#### DELETE /roles/unassign/{userId}/{roleName}
Remover role de usuário

**Headers:**
- `Authorization: Bearer {access_token}`

**Response (200):** Vazio

## Tratamento de Erros

Todos os erros seguem o formato:

```json
{
  "error_code": "OA-XXX",
  "error_description": "Descrição do erro",
  "error_source": "OAuthAPI",
  "error_stack": []
}
```

### Códigos de Erro Comuns

- `OA-400`: Bad Request - Erro na estrutura da chamada
- `OA-401`: Unauthorized - Token inválido ou credenciais incorretas
- `OA-403`: Forbidden - Token não possui permissão
- `OA-404`: Not Found - Recurso não encontrado
- `OA-409`: Conflict - Conflito (ex: username já existe)
- `OA-500`: Internal Server Error - Erro interno

## Desenvolvimento

### Construir o projeto

```bash
./mvnw clean package
```

### Executar localmente

```bash
./mvnw spring-boot:run
```

### Estrutura do Projeto

```
src/
├── main/
│   ├── java/
│   │   └── com/grupo6/constrsw/
│   │       ├── ConstrswApplication.java
│   │       ├── controller/
│   │       │   ├── AuthController.java
│   │       │   ├── UserController.java
│   │       │   └── RoleController.java
│   │       ├── dto/
│   │       │   ├── AuthRequest.java
│   │       │   ├── AuthResponse.java
│   │       │   ├── UserRequest.java
│   │       │   ├── UserResponse.java
│   │       │   ├── RoleRequest.java
│   │       │   ├── RoleResponse.java
│   │       │   ├── PasswordUpdateRequest.java
│   │       │   └── ApiError.java
│   │       ├── service/
│   │       │   └── KeycloakService.java
│   │       └── exception/
│   │           └── GlobalExceptionHandler.java
│   └── resources/
│       └── application.properties
```
