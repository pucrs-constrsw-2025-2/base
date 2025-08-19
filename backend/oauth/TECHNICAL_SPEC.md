# Especificação Técnica – API Gateway NestJS com Keycloak

## 1. Arquitetura do Sistema

### Visão Geral

A aplicação segue uma arquitetura em camadas bem definida para garantir a separação de responsabilidades, escalabilidade e manutenibilidade. As camadas são:

- **Controller**: A camada mais externa, responsável por receber as requisições HTTP, validar os dados de entrada (DTOs) e delegar a execução para a camada de serviço. Ela atua como o ponto de entrada da API.
- **Service**: A camada intermediária que orquestra a lógica de negócio. Ela é responsável por executar as regras da aplicação, coordenar as operações e desacoplar os controllers da lógica de acesso a dados ou serviços externos.
- **Adapter**: A camada mais interna, responsável por abstrair a comunicação com serviços externos. Neste projeto, o `KeycloakAdapter` encapsula todas as chamadas para a API REST do Keycloak, tratando da autenticação, comunicação HTTP e transformação de dados.

### Padrões Aplicados

- **Adapter**: Implementado no `KeycloakAdapter`, que adapta a API REST do Keycloak para uma interface (`IKeycloakAdapter`) consumida pelos serviços da aplicação.
- **Data Transfer Object (DTO)**: Utilizado para definir a estrutura dos dados de entrada e saída da API. DTOs como `CreateUserDto` e `UpdateUserDto` usam `class-validator` para garantir a integridade dos dados na camada de Controller.
- **Injeção de Dependência (DI)**: Utilizada extensivamente pelo NestJS para gerenciar o ciclo de vida e as dependências entre os componentes (Controllers, Services, Adapters), promovendo o baixo acoplamento.
- **Decorator**: Padrão central no NestJS, usado para definir rotas (`@Get`, `@Post`), validar dados (`@Body`), gerenciar segurança (`@Public`) e injetar dependências.
- **Guard**: O `AuthGuard` é um guard global que intercepta todas as requisições para validar o token JWT, protegendo as rotas da aplicação.

### Tecnologias

- **Framework**: NestJS
- **Linguagem**: TypeScript
- **Identity/Access Management**: Keycloak
- **Comunicação HTTP**: Axios (dentro do `KeycloakAdapter`)
- **Testes**: Jest (para testes unitários e e2e) e Supertest
- **Containerização**: Docker e Docker Compose

---

## 2. Mapeamento de Componentes e Responsabilidades

- **Módulo (`*.module.ts`)**: Responsável pelo encapsulamento e pela configuração da injeção de dependência. Ele agrupa controllers, providers (services, adapters) e outros módulos, definindo um escopo claro de funcionalidade.

- **Controller (`*.controller.ts`)**: Ponto de entrada da API. Suas responsabilidades são:
  - Mapear rotas HTTP com os respectivos métodos (ex: `GET /users/:id`).
  - Validar DTOs de entrada usando os pipes do NestJS (ex: `ValidationPipe`).
  - Delegar a execução da lógica de negócio para a camada de Serviço.

- **Service (`*.service.ts`)**: Camada de orquestração da lógica de negócio. Suas responsabilidades são:
  - Executar as regras e fluxos de negócio (ex: criar um usuário).
  - Coordenar chamadas para a camada de Adapter para interagir com serviços externos.

- **Interface de Serviço (`*.interface.ts`)**: Define o contrato público que um componente deve seguir. A `IKeycloakAdapter` define os métodos que o `KeycloakAdapter` concreto deve implementar, permitindo que os serviços dependam de uma abstração, não de uma implementação (Princípio da Inversão de Dependência).

- **Adapter (`*.adapter.ts`)**: Camada de acesso a serviços externos. Suas responsabilidades são:
  - Encapsular toda a lógica de comunicação com a API REST do Keycloak.
  - Realizar as chamadas HTTP, incluindo a obtenção e o uso de tokens de acesso.
  - Tratar as respostas e os erros da API externa, convertendo-os para formatos ou exceções da aplicação.

- **DTO (`*.dto.ts`)**: Define a estrutura e as regras de validação para os dados que transitam pela API. Garante que os dados de entrada estejam no formato correto antes de serem processados pela lógica de negócio.

---

## 3. Fluxos de Dados (Sequência de Operações)

### A. Fluxo de Autenticação (POST /login)

1.  Uma requisição `POST /auth/login` é recebida pelo `AuthController` com `username` e `password`.
2.  O `AuthController` invoca o método `login` do `AuthService`.
3.  O `AuthService` delega a chamada para o método `login` do `KeycloakAdapter`.
4.  O `KeycloakAdapter` monta e executa uma requisição `POST` para o endpoint `/realms/{realm-name}/protocol/openid-connect/token` do Keycloak, com `grant_type=password` e as credenciais do usuário.
5.  O Keycloak valida as credenciais e retorna um objeto contendo o `access_token`.
6.  A resposta é propagada de volta pelo `Adapter` e `Service` até o `Controller`, que a envia como resposta da requisição HTTP.

### B. Fluxo de Acesso a Recurso Protegido (ex: GET /users/:id)

1.  Uma requisição `GET /users/:id` com um `Authorization: Bearer <token>` é recebida pela API.
2.  O `AuthGuard` global intercepta a requisição. Ele extrai o token e invoca o `keycloakAdapter.validateToken(token)`.
3.  O `KeycloakAdapter` faz uma requisição ao endpoint de introspecção de token do Keycloak para validar o token.
4.  Se o token for válido e ativo, o `AuthGuard` libera a requisição para prosseguir.
5.  A requisição chega ao método `findOne` do `UsersController`.
6.  O `UsersController` invoca o `usersService.findOne(id)`.
7.  O `UsersService` invoca o `keycloakAdapter.findUserById(id)`.
8.  O `KeycloakAdapter` executa uma requisição `GET` para o endpoint `/admin/realms/{realm-name}/users/:id` da API Admin do Keycloak.
9.  A resposta do Keycloak com os dados do usuário é recebida e retornada pelo `Adapter`.
10. Os dados são propagados de volta para o `Service`, `Controller` e, finalmente, como resposta HTTP.

### C. Mecanismo de Tratamento de Erros

A estratégia de tratamento de erros é centralizada no `KeycloakAdapter` para converter erros da API externa em exceções semânticas do NestJS.

1.  O `KeycloakAdapter` envolve todas as suas chamadas HTTP `axios` em blocos `try...catch`.
2.  No bloco `catch`, o status code da resposta de erro do Keycloak é inspecionado.
3.  O status code é mapeado para uma exceção apropriada do NestJS:
    - **401 (Unauthorized)** -> `UnauthorizedException`
    - **404 (Not Found)** -> `NotFoundException`
    - **409 (Conflict)** -> `ConflictException` (ex: usuário já existe)
    - Outros erros (ex: 5xx) -> `InternalServerErrorException`
4.  A exceção do NestJS é lançada pelo `Adapter`.
5.  O `HttpExceptionFilter` global do NestJS captura a exceção e formata uma resposta HTTP padronizada com o status code e a mensagem de erro correspondentes.
