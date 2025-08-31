#  Repositório Base grupo 3

---

## 📦 Estrutura do Projeto

- **backend/oauth/**: Serviço principal de autenticação e usuários ([Veja mais](backend/oauth/README.md))
- **backend/utils/sonarqube/**: Scripts e instruções para análise de qualidade de código ([Veja mais](backend/utils/sonarqube/README.md))

## Estrutura de pastas
base/
├── backend/
│   ├── oauth/
│   │   ├── src/
│   │   │   ├── app.module.ts
│   │   │   ├── main.ts
│   │   │   ├── common/
│   │   │   │   ├── errors/
│   │   │   │   └── filters/
│   │   │   ├── roles/
│   │   │   │   ├── roles.controller.ts
│   │   │   │   ├── roles.service.ts
│   │   │   │   └── dtos/
│   │   │   ├── users/
│   │   │   │   ├── users.controller.ts
│   │   │   │   ├── users.service.ts
│   │   │   │   └── dtos/
│   │   │   └── ...
│   │   ├── test/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── ...
│   └── utils/
│       ├── keycloak/
│       │   ├── Dockerfile
│       │   └── constrsw.json
│       ├── sonarqube/
│       │   ├── README.md
│       │   ├── setup-sonar.ps1
│       │   ├── init-sonar.sh
│       │   ├── Dockerfile
│       │   ├── sonar.env.example
│       │   ├── sonar.properties
│       │   └── .dockerignore
│       └── postgresql/
│           ├── Dockerfile
│           ├── databases.sql
│           ├── init-postgres.sh
│           └── postgres-isready.sh
├── docker-compose.yml
├── .env
├── README.md
├── ConstrSW.postman_collection.json
├── ConstrSW.postman_environment.json
├── KeycloakRestAPI.postman_collection.json
├── KeycloakRestAPI.postman_environment.json
└── constrsw-2025-2.code-workspace

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
```

### 3. Subir os Serviços
Na raiz do projeto, execute:
```bash
docker compose up
```

- Acesse o Swagger da API: [http://localhost:3000/docs](http://localhost:3000/docs)
- Acesse o SonarQube: [http://localhost:9000](http://localhost:9000)

---

## ℹ️ Observações sobre os serviços
- O serviço de banco de dados está em **backend/utils/postgresql** (container: `postgresql`).
- O serviço de autenticação está em **backend/oauth** (container: `oauth`).
- O serviço de Keycloak está em **backend/utils/keycloak** (container: `keycloak`).
- O serviço de análise de código está em **backend/utils/sonarqube** (container: `sonarqube`).

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
---

## 💡
- Para visualizar a documentação da API, acesse o Swagger após subir o serviço OAuth.
- Para rodar testes, veja instruções no README do OAuth.
- Para configurar e analisar qualidade de código, veja o README do SonarQube.

