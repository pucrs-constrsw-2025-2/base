# 🏗️ Projeto ConstrSW - Base

Este repositório contém a arquitetura **base** do projeto **ConstrSW - Grupo 8**.  
Ele é responsável por orquestrar todos os serviços principais da aplicação via **Docker Compose**.

---

## 📦 Pré-requisitos

Antes de iniciar, certifique-se de ter instalado:

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

---

## ▶️ Como rodar o projeto

1. Clone o repositório.
2. Para subir os containers, execute:

   ```bash
   docker compose up --build
   ```

3. Para rodar em background:

   ```bash
   docker compose up -d
   ```

4. Para parar os containers:

   ```bash
   docker compose down
   ```

---

## 🌐 Arquitetura

O projeto é composto pelos seguintes serviços:

| Serviço       | Porta Externa | Porta Interna | URL                          |
|---------------|---------------|---------------|------------------------------|
| Frontend      | 3001          | 80            | http://localhost:3001        |
| OAuth / Swagger | 3000        | 3000          | http://localhost:3000/api    |
| Keycloak      | 8001          | 8080          | http://localhost:8001        |
| PostgreSQL    | 5432          | 5432          | localhost:5432               |
| SonarQube     | 9000          | 9000          | http://localhost:9000        |

---

## 🔑 Autenticação

- O **OAuth** é responsável pelo fluxo de autenticação, integrado ao **Keycloak**.
- O **Keycloak** gerencia usuários, roles e permissões no realm `constrsw`.
- O **Frontend** consome o OAuth para login e proteção de rotas.

---

## 📂 Estrutura do Repositório

```
base/
├── backend/              # Serviços backend (oauth, utils, etc.)
├── frontend/             # Aplicação frontend
├── docker-compose.yml    # Orquestração dos containers
├── .env.example          # Variáveis de ambiente
├── README.md             # Este arquivo
└── ...
```

---

## 🛠️ Comandos Úteis

- Ver logs de todos os serviços:

   ```bash
   docker compose logs -f
   ```

- Ver logs de um serviço específico (exemplo: oauth):

   ```bash
   docker compose logs -f oauth
   ```

- Reconstruir e reiniciar apenas um serviço (exemplo: oauth):

   ```bash
   docker compose up -d --build oauth
   ```
