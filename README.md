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

- Java Spring Boot
- PostgreSQL
- Keycloak (OAuth2/OpenID Connect)
- SonarQube

## 🛠️ Instalação e Execução

### Pré-requisitos

- Docker e Docker Compose
- Node.js 18+ (para desenvolvimento local do frontend)
- Java 17+ (para desenvolvimento local do backend)

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

- **Frontend**: http://localhost:3000
- **Swagger Documentation**: http://localhost:8080/swagger-ui.html
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

#### Backend

```bash
cd backend
./mvnw spring-boot:run
```

## 🔐 Autenticação

O sistema utiliza Keycloak para autenticação. Credenciais padrão:

- **Admin Keycloak**: admin / a12345678
- **Usuários de teste**: Ver documentação do frontend

## 📁 Estrutura do Projeto

```
constrsw-2025-2/
├── frontend/              # Aplicação React
│   ├── src/
│   ├── Dockerfile
│   └── README.md
├── backend/               # API REST
│   ├── oauth/
│   └── utils/
├── docker-compose.yml     # Orquestração dos serviços
├── .env                   # Variáveis de ambiente
└── README.md             # Este arquivo
```

## 📚 Documentação

- [Frontend README](./frontend/README.md) - Documentação detalhada do frontend
- [Autenticação](./frontend/AUTHENTICATION.md) - Estratégias de autenticação
- [API Documentation (Swagger)](http://localhost:8080/swagger-ui.html) - Documentação interativa da API
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

**Última atualização**: Janeiro 2025

# Closed CRAS

Base repository for the Closed CRAS application.

The "Closed CRAS" project is a full-stack, polyglot microservices application. It serves as a foundational template or "base" repository for building a larger system, providing essential infrastructure for development, authentication, and code quality management. The project follows a modern microservices architecture, with a backend composed of independent services designed to support multiple programming languages. The current implementation includes an authentication service written in Rust, and the SonarQube configuration shows examples for Java, Python, and Node.js, highlighting the project's goal to support a polyglot environment.

The system uses Keycloak as a centralized identity and access management (IAM) solution, with a custom OAuth service that integrates with it to handle user management. The project relies on Docker and Docker Compose to containerize and orchestrate all services, including PostgreSQL, Keycloak, and SonarQube, ensuring a consistent development environment. Continuous code quality is a core principle, with SonarQube pre-configured for static analysis to identify bugs, vulnerabilities, and code smells.

## Badges

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com)
[![Quality Gate Status](https://img.shields.io/badge/quality-passing-brightgreen)](http://localhost:9000)
[![Coverage](https://img.shields.io/badge/coverage-15%25-brightgreen)](http://localhost:9000)

## Technologies

- **Backend**:
  - **Rust**: Used in the authentication service (OAuth).
  - **Keycloak**: For identity and access management.
  - **PostgreSQL**: Relational database.
- **DevOps & Tools**:
  - **Docker & Docker Compose**: For containerization and service orchestration.
  - **SonarQube**: For continuous code quality analysis.

## Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/pucrs-constrsw-2025-2/base.git
    cd base
    ```

2.  **Create the Docker volumes:**
    ```bash
    docker volume create constrsw-keycloak-data
    docker volume create constrsw-postgresql-data
    docker volume create constrsw-sonarqube-data
    docker volume create constrsw-sonarqube-extensions
    docker volume create constrsw-sonarqube-logs
    ```

## Usage

1.  **Start the application:**
    Use Docker Compose to build and start all services in detached mode.

    ```bash
    docker-compose up --build -d
    ```

2.  **Accessing the Services:**

    The credentials to access the services are configured in the `.env` file. Refer to this file to get the username and password values. For example:

    - **Keycloak Admin Console**: [http://localhost:8001](http://localhost:8001)
      - **User**: Defined in `KEYCLOAK_ADMIN`
      - **Password**: Defined in `KEYCLOAK_ADMIN_PASSWORD`
    - **SonarQube**: [http://localhost:9000](http://localhost:9000)
      - **User**: Defined in `SONARQUBE_USER`
      - **Password**: Defined in `SONARQUBE_PASSWORD`
    - **OAuth Service API**: [http://localhost:8000](http://localhost:8000)
    - **PostgreSQL**: Accessible on port `5432` at `localhost`.
      - **User**: Defined in `POSTGRESQL_USERNAME`
      - **Password**: Defined in `POSTGRESQL_PASSWORD`

3.  **Stopping the application:**
    ```bash
    docker-compose down
    ```
