# Closed CRAS 2025-2

Sistema de Gestão de Recursos Computacionais desenvolvido para a disciplina de Construção de Software - PUCRS 2025-2.

## 📋 Sobre o Projeto

O Closed CRAS é um sistema completo para gerenciamento de recursos computacionais de uma universidade, incluindo:

- **Frontend**: Interface web desenvolvida em React + TypeScript
- **Backend**: API REST com autenticação OAuth2/Keycloak
- **Banco de Dados**: PostgreSQL
- **Análise de Código**: SonarQube
- **Autenticação**: Keycloak

## 🚀 Tecnologias Utilizadas

### Frontend

- React 18.3.1 + TypeScript
- Vite + Tailwind CSS
- shadcn/ui + Radix UI
- React Hook Form + Sonner

### Backend

- NestJS
- PostgreSQL
- Keycloak (OAuth2/OpenID Connect)
- SonarQube

## 🛠️ Instalação e Execução

### Pré-requisitos

- Docker e Docker Compose
- Node.js 18+ (para desenvolvimento local do frontend/backend)

### Execução com Docker (Recomendado)

1. **Clone o repositório**:

```bash
git clone <repository-url>
cd constrsw-2025-2
```

2. **Configure as variáveis de ambiente**:

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite as variáveis conforme necessário
nano .env
```

3. **Execute o sistema completo**:

```bash
# Linux/Mac
./build-frontend.sh

# Windows PowerShell
.\build-frontend.ps1

# Ou manualmente
docker-compose up -d
```

4. **Acesse os serviços**:

- **Frontend**: http://localhost:5000
- **Backend**: http://localhost:3000
- **Keycloak**: http://localhost:8001
- **SonarQube**: http://localhost:9000
- **PostgreSQL**: localhost:5432

### Desenvolvimento Local

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 🔐 Autenticação

O sistema utiliza Keycloak para autenticação. Credenciais padrão:

- **Admin Keycloak**: admin / a12345678
- **Usuários de teste**: Ver documentação do frontend

## 📁 Estrutura do Projeto

base/
├── backend/
│ ├── oauth/ # Serviço de autenticação (NestJS)
│ │ ├── src/
│ │ │ ├── app.module.ts
│ │ │ ├── main.ts
│ │ │ ├── common/ # Código compartilhado
│ │ │ │ ├── errors/
│ │ │ │ └── filters/
│ │ │ ├── roles/ # Módulo de gerenciamento de papéis
│ │ │ │ ├── roles.controller.ts
│ │ │ │ ├── roles.service.ts
│ │ │ │ └── dtos/
│ │ │ └── users/ # Módulo de gerenciamento de usuários
│ │ │ ├── users.controller.ts
│ │ │ ├── users.service.ts
│ │ │ └── dtos/
│ │ ├── test/ # Testes automatizados
│ │ ├── Dockerfile
│ │ └── package.json
│ └── utils/
│ ├── keycloak/ # Configuração do Keycloak
│ │ ├── Dockerfile
│ │ └── constrsw.json # Configuração do realm
│ ├── sonarqube/ # Configuração do SonarQube
│ │ ├── README.md
│ │ ├── setup-sonar.ps1
│ │ ├── init-sonar.sh
│ │ ├── Dockerfile
│ │ ├── sonar.env.example
│ │ ├── sonar.properties
│ │ └── .dockerignore
│ └── postgresql/ # Banco de dados (usado pelo SonarQube)
│ ├── Dockerfile
│ ├── databases.sql
│ ├── init-postgres.sh
│ └── postgres-isready.sh
├── frontend/ # Aplicação React
│ ├── src/
│ ├── Dockerfile
│ └── README.md
├── docker-compose.yml
├── .env
├── README.md
├── ConstrSW.postman_collection.json
├── ConstrSW.postman_environment.json
├── KeycloakRestAPI.postman_collection.json
├── KeycloakRestAPI.postman_environment.json
└── constrsw-2025-2.code-workspace

````

---

## 🛠️ Como Rodar o Projeto

### 1. Pré-requisitos
- Docker  instalado
- Node.js instalado (para desenvolvimento local)

### 2. Criar Volumes Necessários
Crie os volumes externos usados pelo Docker Compose:
```bash
docker volume create constrsw-keycloak-data
docker volume create constrsw-postgresql-data
docker volume create constrsw-sonarqube-data
docker volume create constrsw-sonarqube-extensions
docker volume create constrsw-sonarqube-logs
````

## 📚 Documentação

- [Frontend README](./frontend/README.md) - Documentação detalhada do frontend
- [Autenticação](./frontend/AUTHENTICATION.md) - Estratégias de autenticação
- [Postman Collections](./ConstrSW.postman_collection.json) - API endpoints

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 👥 Equipe

Desenvolvido para a disciplina de Construção de Software - PUCRS 2025-2.

---

<<<<<<< HEAD
**Última atualização**: Janeiro 2025
=======

## ℹ️ Observações sobre os serviços

- O serviço de autenticação está em **backend/oauth** (container: `oauth`). Este é o serviço principal que atua como gateway para o Keycloak.
- O serviço de Keycloak está em **backend/utils/keycloak** (container: `keycloak`). Responsável pela gestão de identidade e acesso.
- O serviço de análise de código está em **backend/utils/sonarqube** (container: `sonarqube`).
- O serviço de banco de dados está em **backend/utils/postgresql** (container: `postgresql`). Note que este banco é utilizado exclusivamente pelo SonarQube para armazenar suas análises, não sendo utilizado pela aplicação principal.

---

## 📚 Documentação e Recursos

- **Swagger (API REST):**
  - [http://localhost:3000/docs](http://localhost:3000/docs)
- **SonarQube (Qualidade de Código):**
  - [http://localhost:9000](http://localhost:9000)

---

## ℹ️ Informações Detalhadas

- Para detalhes sobre autenticação, usuários e papéis, acesse o [README do OAuth](backend/oauth/README.md)
- Para instruções de análise de qualidade de código, acesse o [README do SonarQube](backend/utils/sonarqube/README.md)

---

## 💡

- Para visualizar a documentação da API, acesse o Swagger após subir o serviço OAuth.
- Para rodar testes, veja instruções no README do OAuth.
- Para configurar e analisar qualidade de código, veja o README do SonarQube.

> > > > > > > ac7ab43 (docs/fix: editing readme for oauth and fixing swagger auth and error response)
