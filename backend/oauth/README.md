# Serviço de Autenticação OAuth

Este serviço atua como um gateway para o Keycloak, simplificando a gestão de usuários e papéis através de uma API REST.

## 🏗️ Arquitetura

O projeto segue uma organização modular no **backend NestJS**, inspirada em princípios de **separação de responsabilidades** e **boa manutenibilidade**.  

A aplicação está organizada em **módulos independentes** (como `users` e `roles`), além de uma camada `common` para código reutilizável.  

### Estrutura de Pastas



```
src/
├── app.module.ts
├── main.ts
├── common/ # Código compartilhado
│   ├── errors/ # Classes de erro personalizadas
│   └── filters/ # Filtros globais (ex: tratamento de exceções)
├── roles/ # Módulo de gerenciamento de papéis
│   ├── roles.controller.ts
│   ├── roles.service.ts
│   └── dtos/ # Data Transfer Objects
└── users/ # Módulo de gerenciamento de usuários
    ├── users.controller.ts
    ├── users.service.ts
    └── dtos/ # Data Transfer Objects
```

### Organização por Camadas

Embora a estrutura siga o padrão de módulos do **NestJS**, ela incorpora conceitos da arquitetura em camadas:  

#### 1. Camada de Domínio
- Representada principalmente pelas **entidades** e **DTOs**, que definem os dados e regras básicas de negócio.  
- Independe de frameworks externos.  

#### 2. Camada de Aplicação
- Representada pelos **services** (`users.service.ts`, `roles.service.ts`).  
- Implementa a lógica de negócio e os casos de uso da aplicação.  
- Orquestra as operações sobre as entidades.  

#### 3. Camada de Interface / Infraestrutura
- Representada pelos **controllers** (`users.controller.ts`, `roles.controller.ts`).  
- Expõe a API REST para o mundo externo.  
- Interage com frameworks, bibliotecas e serviços externos (ex: integração com Keycloak).  

### Vantagens desta Arquitetura
1. **Separação de responsabilidades**: cada módulo organiza seus controllers, services e dtos, tornando o código mais limpo.  
2. **Facilidade de manutenção**: alterações em um módulo (ex: `users`) não afetam diretamente outros módulos.  
3. **Reutilização**: código genérico fica em `common/`, evitando duplicação.  
4. **Escalabilidade**: novos módulos podem ser adicionados facilmente sem quebrar os existentes.  
5. **Testabilidade**: services e controllers podem ser testados isoladamente.

## 🚀 Funcionalidades

### Gestão de Usuários
- Login de usuários (`POST /login`)
- Criação de usuários (`POST /users`)
- Consulta de usuários (`GET /users`)
- Consulta de usuário por ID (`GET /users/:id`)
- Atualização de usuário (`PUT /users/:id`)
- Atualização de senha (`PATCH /users/:id`)
- Deleção lógica de usuário (`DELETE /users/:id`)

### Gestão de Papéis
- Criação de papéis (`POST /roles`)
- Listagem de papéis (`GET /roles`)
- Consulta de papel por ID (`GET /roles/:id`)
- Atualização de papel (`PUT /roles/:id`)
- Remoção de papel (`DELETE /roles/:id`)
- Atribuição de papel a usuário (`POST /roles/:id/users/:userId`)
- Remoção de papel de usuário (`DELETE /roles/:id/users/:userId`)

## 🛠️ Scripts Principais

### Instalação
```bash
npm install
```

### Desenvolvimento
```bash
# É necessário ter uma instância do Keycloak rodando para o teste e desenvolvimento
# nesse sentido, a melhor maneira é utilizar o docker compose do repositório raiz:
docker volume create constrsw-keycloak-data

docker compose up
```

### Testes
```bash
# Executar testes unitários
npm run test

# Executar testes com cobertura
npm run test:cov

# Executar testes e2e
npm run test:e2e
```

### Análise de Código (SonarQube)
```bash
# Executar análise do SonarQube (é necessário ter o container do Sonarqube rodando)
npm run sonar
```

## 📚 Documentação da API

A documentação completa da API está disponível através do Swagger UI:
- Local: http://localhost:3000/docs
- Desenvolvimento: http://localhost:3000/docs

## 🔍 Análise de Qualidade

O projeto utiliza SonarQube para análise de qualidade de código. Para visualizar os resultados:

1. Certifique-se que o container do SonarQube está rodando
2. Execute a análise: `npm run sonar`
3. Acesse: http://localhost:9000
4. Login com as credenciais padrão (admin/admin)
5. Procure pelo projeto "constrsw-oauth"
