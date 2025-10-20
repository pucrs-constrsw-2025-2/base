# 🛡️ OAuth API Gateway para Keycloak

Este projeto é uma API Gateway robusta e de alta performance, construída em Python com FastAPI, que atua como uma camada de desacoplamento para a API REST do Keycloak. O objetivo principal é fornecer uma interface moderna, segura e fácil de usar para gerenciar usuários e roles, seguindo os princípios da Arquitetura Hexagonal (Ports & Adapters).

---

## 🚀 Arquitetura e Padrões de Projeto

A arquitetura do projeto é estritamente baseada no padrão **Ports & Adapters (Arquitetura Hexagonal)**. Essa abordagem garante um forte desacoplamento entre a lógica de negócio principal (o _core_ da aplicação) e as tecnologias externas, como o framework web e o cliente HTTP para o Keycloak.

- **Core (O Hexágono) コア**: Contém a lógica de negócio pura, sem dependências de frameworks. Inclui os `domain models`, `ports` (interfaces) e `services`.
- **Adapters (As Portas) アダプター**: São as implementações concretas que interagem com o mundo exterior.
  - **Driving Adapter**: A API FastAPI, que "dirige" a aplicação (`adapters/api`).
  - **Driven Adapter**: O cliente para o Keycloak, que é "dirigido" pela aplicação (`adapters/keycloak`).

## 🛠️ Tecnologias e Ferramentas

A seleção de tecnologias priorizou performance, segurança e um ecossistema moderno para o desenvolvimento de APIs.

| Categoria                  | Ferramenta                                                                                                                                 |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Linguagem & Framework**  | 🐍 `Python 3.12` <br> ⚡ `FastAPI`                                                                                                         |
| **Servidor ASGI**          | 🦄 `Uvicorn` com `Gunicorn`                                                                                                                |
| **Gerenciador de Pacotes** | 📦 `Poetry`                                                                                                                                |
| **Qualidade de Código**    | 린터 `Ruff` (Linter) <br> 🎨 `Black` (Formatador) <br> 🔒 `MyPy` (Análise de Tipos)                                                        |
| **Testes**                 | 🧪 `Pytest` & `Pytest-Cov`                                                                                                                 |
| **Cliente HTTP**           | 🌐 `HTTPX` (com suporte a async/await)                                                                                                     |
| **Validação & Config.**    | ✅ `Pydantic V2` <br> ⚙️ `Pydantic-Settings`                                                                                               |
| **Segurança (AppSec)**     | 🔑 `python-jose` (Validação de JWT) <br> 🤫 `passlib` (Hashing de senhas) <br> 🐞 `Bandit` (SAST) <br> 🐳 `Trivy` (Scan de Imagens Docker) |

## 📁 Estrutura de Diretórios

A estrutura do projeto reflete a arquitetura hexagonal, separando claramente as responsabilidades.

    /oauth/
    ├── .github/
    │   └── workflows/
    │       └── ci.yml                # 🚀 Pipeline de CI/CD (lint, test, scan)
    ├── oauth_api/
    │   ├── main.py                   # 🏁 Entrypoint da aplicação FastAPI
    │   ├── config.py                 # ⚙️ Configuração com Pydantic-Settings
    │   ├── core/                     # 헥사곤 Lógica de Negócio (O Hexágono)
    │   │   ├── domain/               # 📦 Modelos de domínio (User, Role)
    │   │   ├── ports/                # 🔌 Interfaces (ex: IUserRepository)
    │   │   └── services/             # 💼 Orquestração da lógica de negócio
    │   └── adapters/                 # 🚪 Implementações (As Portas)
    │       ├── api/                  # 🌐 Driving Adapter (FastAPI)
    │       └── keycloak/             # 🔑 Driven Adapter (Cliente Keycloak)
    ├── tests/                        # 🧪 Testes Unitários e de Integração
    ├── pyproject.toml                # 📦 Definição do projeto e dependências (Poetry)
    ├── Dockerfile                    # 🐳 Dockerfile da aplicação
    └── README.md                     # 📖 Você está aqui!

## 📜 Documentação da API (Swagger)

A documentação interativa da API é gerada automaticamente pelo FastAPI e está disponível para testes e consulta dos endpoints.

- **URL da Documentação Swagger UI:** `/docs`

> Exemplo: `http://localhost:8000/docs`

## API Endpoints

### Autenticação

| Método | Endpoint | Descrição                                  |
| :----- | :------- | :----------------------------------------- |
| `POST` | `/login` | Realiza a autenticação e retorna um token. |

### Usuários (`/users`)

| Método   | Endpoint      | Descrição                                                                  |
| :------- | :------------ | :------------------------------------------------------------------------- | -------- |
| `POST`   | `/users`      | Cria um novo usuário. Responde com `409 Conflict` se o usuário já existir. |
| `GET`    | `/users`      | Lista todos os usuários. Suporta filtro por status com `?enabled=[true     | false]`. |
| `GET`    | `/users/{id}` | Obtém os detalhes de um usuário específico.                                |
| `PUT`    | `/users/{id}` | Atualiza todas as informações de um usuário.                               |
| `PATCH`  | `/users/{id}` | Atualiza a senha de um usuário.                                            |
| `DELETE` | `/users/{id}` | Realiza a exclusão lógica de um usuário (desativa o usuário).              |

### Roles (`/roles` e Associações)

| Método   | Endpoint                 | Descrição                                 |
| :------- | :----------------------- | :---------------------------------------- |
| `POST`   | `/roles`                 | Cria uma nova role.                       |
| `GET`    | `/roles`                 | Lista todas as roles.                     |
| `GET`    | `/roles/{id}`            | Obtém os detalhes de uma role específica. |
| `PUT`    | `/roles/{id}`            | Atualiza as informações de uma role.      |
| `DELETE` | `/roles/{id}`            | Exclui uma role.                          |
| `POST`   | `/users/{user_id}/roles` | Atribui uma ou mais roles a um usuário.   |
| `DELETE` | `/users/{user_id}/roles` | Remove uma ou mais roles de um usuário.   |

# 🚀 Guia de Desenvolvimento e Operação

Este guia contém todas as instruções necessárias para configurar, executar, testar e manter a qualidade do código do projeto.

---

## 📋 Requisitos do Sistema

Para compilar e executar este projeto, você precisará ter os seguintes softwares instalados em seu sistema:

- **Python**: A versão `3.12` é a utilizada no projeto.
- **Poetry**: O projeto utiliza Poetry para gerenciamento de dependências e ambientes virtuais.
- **Git**: Para clonar o repositório e gerenciar o controle de versão.

---

## 🛠️ Passo a Passo para Instalação e Configuração do Ambiente

Siga estas etapas para configurar o ambiente de desenvolvimento localmente.

1.  **Instale o Poetry**: Se você ainda não tem o Poetry, instale-o. O método de instalação recomendado pode ser encontrado na documentação oficial. O comando mais comum é:

    ```bash
    curl -sSL [https://install.python-poetry.org](https://install.python-poetry.org) | python3 -
    ```

2.  **Clone o Repositório**: Faça o clone do projeto do GitHub para a sua máquina local.

    ```bash
    git clone [https://github.com/pucrs-constrsw-2025-2/base.git](https://github.com/pucrs-constrsw-2025-2/base.git)
    cd base/backend/oauth
    ```

3.  **Instale as Dependências**: O Poetry lerá o arquivo `pyproject.toml` e instalará todas as dependências necessárias, incluindo as de desenvolvimento como `pytest` e `ruff`.

    ```bash
    poetry install
    ```

    Este comando cria um ambiente virtual isolado para o projeto, garantindo que as dependências não entrem em conflito com outros projetos.

4.  **Configure as Variáveis de Ambiente**: O projeto utiliza um arquivo `.env` para gerenciar segredos e configurações de forma segura.
    - Copie o arquivo de exemplo `.env.example` para um novo arquivo chamado `.env`.
      ```bash
      cp .env.example .env
      ```
    - Abra o arquivo `.env` e preencha as variáveis com os valores corretos para o seu ambiente de desenvolvimento (URLs do Keycloak, credenciais, etc.).

---

## ▶️ Passo a Passo para Execução em Desenvolvimento

Com o ambiente configurado, você pode iniciar o servidor da aplicação.

1.  **Inicie o Servidor**: O projeto usa o `Uvicorn` como servidor ASGI para o `FastAPI`. O ponto de entrada da aplicação é `oauth_api/main.py`.

    - Execute o seguinte comando na raiz do projeto para iniciar o servidor em modo de desenvolvimento (com recarregamento automático após alterações no código):
      ```bash
      poetry run uvicorn oauth_api.main:app --reload
      ```

2.  **Acesse a Aplicação**: O servidor estará rodando. Você pode acessar a documentação interativa (Swagger UI), que é gerada automaticamente pelo FastAPI, em seu navegador para testar os endpoints: `http://127.0.0.1:8000/docs`.

---

### 🧪 Passo a Passo para Testes

O projeto está configurado com `pytest` para testes automatizados e `pytest-cov` para relatórios de cobertura.

1.  **Execute a Suíte de Testes Completa**: Para rodar todos os testes unitários e de integração, use o seguinte comando:

    ```bash
    poetry run pytest
    ```

2.  **Gere um Relatório de Cobertura**: Para executar os testes e ver um relatório de cobertura de código no terminal, utilize:
    ```bash
    poetry run pytest --cov=oauth_api
    ```
    Isso mostrará quais partes do seu código na pasta `oauth_api` foram cobertas pelos testes.

---

### 🧹 Passo a Passo para Linting e Formatação

Para garantir a qualidade e a consistência do código, o projeto utiliza `Ruff` , `Black` e `MyPy`.

1.  **Verifique o Código com o Linter (Ruff)**: Para encontrar possíveis erros, "code smells" e problemas de estilo, execute o Ruff.

    ```bash
    poetry run ruff check .
    ```

2.  **Verifique a Formatação (Black)**: Para garantir que o código segue um estilo consistente , você pode verificar a formatação com o Black. O comando abaixo não altera os arquivos, apenas informa se eles estão formatados corretamente.

    ```bash
    poetry run black . --check
    ```

    - Para formatar os arquivos automaticamente, remova a flag `--check`:
      ```bash
      poetry run black .
      ```

3.  **Análise Estática de Tipos (MyPy)**: Para detectar erros de tipo antes da execução , use o MyPy.
    `bash
    poetry run mypy .
    `
    > **Nota**: Todas essas ferramentas estão configuradas para rodar automaticamente antes de cada `commit` através do `pre-commit`, garantindo que o código enviado ao repositório mantenha sempre um alto padrão de qualidade.
