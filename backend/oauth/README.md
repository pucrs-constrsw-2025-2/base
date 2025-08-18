# ConstrSW - OAuth API Gateway

Esta é uma API Gateway desenvolvida em Python com FastAPI que atua como uma camada de desacoplamento para a API REST do Keycloak, conforme os requisitos do T1 da disciplina de Construção de Software.

O projeto segue a **Arquitetura Hexagonal (Ports & Adapters)** para garantir um código limpo, testável e de baixa coesão, desacoplando a lógica de negócio das tecnologias externas.

## Arquitetura de Software Adotada

A arquitetura do projeto é baseada no padrão **Ports & Adapters**:

- **Core (Hexágono)**: Localizado em `oauth_api/core`, contém toda a lógica de negócio pura e agnóstica de tecnologia. Ele define `ports` (interfaces) para comunicação com o mundo exterior.
  - `domain`: Modelos de dados do negócio (ex: User, Role).
  - `ports`: Contratos (interfaces abstratas) para os repositórios.
  - `services`: Orquestradores da lógica de negócio.
- **Adapters**: Localizados em `oauth_api/adapters`, são as implementações concretas que interagem com tecnologias externas.
  - **API (Driving Adapter)**: A implementação da API REST com FastAPI. Ela "dirige" o core através das portas.
  - **Keycloak (Driven Adapter)**: A implementação do cliente que consome a API REST do Keycloak.

## Tecnologias

- **Python 3.12**
- **FastAPI**: Framework web para a construção da API.
- **Pydantic**: Para validação de dados e configurações.
- **Poetry**: Para gerenciamento de dependências.
- **HTTPX**: Para realizar chamadas assíncronas à API do Keycloak.
- **Ruff & Black & MyPy**: Para garantir a qualidade e o padrão do código.
- **Pytest**: Para testes unitários e de integração.
- **Docker**: Para a containerização da aplicação.

## Como Executar

### Pré-requisitos

- Docker e Docker Compose
- Python 3.12+
- Poetry

### 1. Configuração do Ambiente

1.  Clone o repositório base e entre no diretório `/backend/oauth`.
2.  Crie um arquivo `.env` a partir do `.env.example` e preencha com as suas credenciais do Keycloak. As variáveis necessárias estão definidas no `docker-compose.yml` do projeto base.
    ```bash
    cp .env.example .env
    ```
3.  Instale as dependências do projeto:
    ```bash
    poetry install
    ```
4.  Ative o ambiente poetry:
    ```bash
    poetry shell
    ```

### 2. Executando com Docker Compose

A forma mais simples de executar é através do `docker-compose.yml` do repositório base. Certifique-se de que o serviço `oauth` está descomentado.

```bash
# No diretório raiz do repositório base
docker-compose up --build
```
