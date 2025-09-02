# ConstrSW — Microsserviços com FastAPI, Keycloak, PostgreSQL e SonarQube

Este repositório contém a base de um **ecossistema de microsserviços** para um sistema acadêmico (turmas, cursos, aulas, professores, salas, reservas, alunos), com foco inicial em **autenticação e autorização** via **OAuth Service** integrado ao **Keycloak**. A orquestração é feita por **Docker Compose**, e a qualidade de código é monitorada por **SonarQube**.

> **Stack principal**
> - **Backend (OAuth Service):** Python 3.12 + FastAPI (Uvicorn)
> - **IAM:** Keycloak
> - **Banco de Dados:** PostgreSQL 17 (multi‑DB para serviços)
> - **Qualidade:** SonarQube
> - **Coleções:** Postman (inclui coleção e ambiente prontos)
> - **Frontend (placeholder):** Angular + Angular Material (documentação inicial em `frontend/`)

---

## 📁 Estrutura do repositório

```
base/
├─ backend/
│  ├─ oauth/                   # Serviço de autenticação/autorização (FastAPI)
│  │  ├─ main.py               # App FastAPI
│  │  ├─ routers/              # Rotas: users, roles
│  │  ├─ services/             # Integraação com Keycloak
│  │  ├─ models/               # Modelos Pydantic (User, Role, etc.)
│  │  ├─ tests/                # Testes unitários e de integração (pytest)
│  │  ├─ config.py             # Variáveis lidas do ambiente (.env)
│  │  └─ Dockerfile            # Imagem do serviço OAuth
│  ├─ utils/
│  │  ├─ keycloak/             # Dockerfile do Keycloak + realm export (`constrsw.json`)
│  │  ├─ postgresql/           # Dockerfile + scripts de init e healthcheck
│  │  └─ sonarqube/            # Dockerfile + bootstrap do SonarQube
│  └─ sonar-project.properties # Config para análise SonarQube
├─ frontend/
│  ├─ README.md                # Guia inicial (Angular + Angular Material)
│  └─ AUTHENTICATION.md        # Notas de autenticação (quando aplicável)
├─ docker-compose.yml          # Orquestra todos os serviços
├─ .env                        # Variáveis de ambiente (exemplo incluído)
├─ ConstrSW.postman_collection.json
├─ ConstrSW.postman_environment.json
├─ KeycloakRestAPI.postman_collection.json
└─ README.md                   # (Este arquivo)
```

---

## 🧩 Visão geral da arquitetura

- **OAuth Service (FastAPI)** expõe endpoints para login/refresh, usuários e roles; ele **não autentica por conta própria**, e sim **orquestra** fluxos com o **Keycloak** (admin API).
- **Keycloak** centraliza identidade (realm `constrsw`, client `oauth`) e políticas de acesso (roles, mapeamentos).
- **PostgreSQL** provê bancos independentes para cada futuro microsserviço, além do `sonar`.
- **SonarQube** oferece portal para inspeção estática e cobertura dos módulos Python.
- **Docker Compose** sobe tudo de ponta a ponta e configura healthchecks/volumes persistentes.

---

## ✅ Pré‑requisitos

- Docker 24+ e Docker Compose
- (Opcional) Python 3.12+ para rodar o OAuth Service localmente sem Docker

---

## ⚙️ Configuração (variáveis de ambiente)

As variáveis principais estão em **`.env`** (já incluído). Ajuste conforme seu ambiente:

- **Keycloak**: `KEYCLOAK_ADMIN`, `KEYCLOAK_ADMIN_PASSWORD`, `KEYCLOAK_REALM`, `KEYCLOAK_CLIENT_ID`, `KEYCLOAK_CLIENT_SECRET`, hosts/ports internos e externos.
- **PostgreSQL**: usuário/senha, host interno (`postgresql`), porta externa (padrão `5432`).
- **SonarQube**: `SONAR_WEB_PORT` (padrão `9000`), `SONARQUBE_USER` e `SONARQUBE_PASSWORD`, token (`SONAR_TOKEN`).

---

## 🐳 Subindo tudo com Docker

1) **Crie os volumes externos** (persistência):

```bash
docker volume create constrsw-keycloak-data
docker volume create constrsw-postgresql-data
docker volume create constrsw-sonarqube-data
docker volume create constrsw-sonarqube-extensions
docker volume create constrsw-sonarqube-logs
```

2) **Suba os serviços**:

```bash
docker compose up -d --build
```

3) **Acesse os componentes** (valores padrão; confirme portas no `.env`):
- **OAuth Service (FastAPI):** http://localhost:8000 → **Swagger** em `/docs`
- **Keycloak (Console Admin):** http://localhost:8001 (usuário/senha → ver `.env`)
- **SonarQube:** http://localhost:9000 (login inicial → ver `.env`)
- **PostgreSQL:** `localhost:5432`

> ⏱️ Na **primeira execução**, Keycloak e SonarQube podem demorar alguns segundos para ficarem *UP* (inicialização e migrações).

---

## 🔐 Preparando o Keycloak (realm e client)

Você pode importar o realm pronto **`backend/utils/keycloak/constrsw.json`**:

1. Entre no **Keycloak Admin Console**.
2. Vá em **Realm settings → Import** e selecione o arquivo `constrsw.json`.
3. Verifique se existem o **client** `oauth` e as **roles** básicas.
4. Atualize, se necessário, os segredos/redirects para seu ambiente.

> O **OAuth Service** usa as credenciais e URLs do Keycloak definidas no `.env` para:
> - Obter/renovar **tokens**;
> - **Criar/atualizar/desativar usuários**;
> - **Gerenciar roles** e atribuições.

---

## 🛠️ Endpoints (OAuth Service)

Base URL (padrão): **`http://localhost:8000`**

### Autenticação
- `POST /users/login` → obtém **access_token** (password grant via Keycloak)
- `POST /refresh` → renova token (se habilitado)
- `GET /validate` → valida token (se habilitado)

### Usuários (`/users`)
- `POST /users` → cria usuário (campos típicos: `username`, `first_name`, `last_name`, `email`, `credentials=[{{type,password,temporary}}]`)
- `GET /users` → lista usuários
- `GET /users/{user_id}` → detalhes
- `PUT /users/{user_id}` → atualiza dados
- `PATCH /users/{user_id}` → atualiza parcialmente (inclui senha)
- `DELETE /users/{user_id}` → desativa usuário

> Cabeçalho de autorização: `Authorization: Bearer <access_token>`

### Roles (`/roles`)
- `POST /roles` → cria role
- `GET /roles` → lista roles
- `GET /roles/{name}` → busca por nome
- `PUT /roles/{name}` / `PATCH /roles/{name}` → atualiza
- `DELETE /roles/{name}` → remoção lógica
- `POST /roles/{name}/assign` → atribui role a usuário (`{{ "user_id": "…" }}`)
- `DELETE /roles/{name}/unassign` → remove role do usuário

---

## 🧪 Testes automatizados

Há testes **unitários** e de **integração** em `backend/oauth/tests/` (Pytest).

- **Dentro do container** do OAuth Service (nome: `fastapi`):
```bash
docker exec -it fastapi sh -c "export PYTHONPATH=/app && pytest -q"
```

- **Localmente (sem Docker):**
```bash
cd backend/oauth
python -m venv .venv && source .venv/bin/activate  # (Windows: .venv\Scripts\activate)
pip install -r requirements.txt
export PYTHONPATH=/app  # ou: export PYTHONPATH=$(pwd)
pytest -q
```

> Os testes de integração que conversam com o Keycloak exigem que o **Keycloak esteja rodando** e que variáveis de acesso estejam corretas (`config.py` lê do ambiente).

---

## 🔎 Qualidade de código (SonarQube)

- Suba o SonarQube (via Docker Compose) e acesse **http://localhost:9000**.
- O arquivo `backend/sonar-project.properties` já referencia:
  - `sonar.sources=oauth/models,oauth/routers,oauth/services`
  - `sonar.tests=oauth/tests`
  - `sonar.host.url=http://localhost:9000`
  - `sonar.token=…` (ajuste conforme seu ambiente)

Execute a análise usando o **sonar-scanner** com este arquivo de propriedades (instale o CLI ou utilize uma pipeline CI que já inclua o scanner).

---

## 🗃️ Banco de dados

O container do PostgreSQL usa scripts em `backend/utils/postgresql/` para **criar usuários e bancos** para cada serviço (ex.: `classes`, `courses`, `lessons`, `professors`, `reservations`, `resources`, `rooms`, `students`) e para o `sonar`.

- Arquivos relevantes:
  - `databases.sql`
  - `init-postgres.sh`
  - `postgres-isready.sh`

> Senhas/usuários estão parametrizados/definidos nos scripts e `.env`. Ajuste para produção.

---

## 🧰 Desenvolvimento local do OAuth Service (sem Docker)

```bash
cd backend/oauth
python -m venv .venv && source .venv/bin/activate  # (Windows: .venv\Scripts\activate)
pip install -r requirements.txt
export KEYCLOAK_URL=...
export REALM_NAME=constrsw
export CLIENT_ID=oauth
export CLIENT_SECRET=...
export KEYCLOAK_USERNAME=admin
export KEYCLOAK_PASSWORD=...
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Acesse **http://localhost:8000/docs** para a UI do Swagger.

---

## 📬 Coleções Postman

- **`postman-config.json`** -> endpoints do ecossistema.

Importe esse json no Postman e ajuste o ambiente para sua máquina.

---

## 💬 Suporte

Abra uma **issue** descrevendo o problema ou dúvida. Se possível, inclua:
- Passos para reproduzir
- Logs/erros relevantes
- Informações de ambiente (SO, Docker, etc.)

---

**Feito com ❤️ pela equipe ConstrSW.**
