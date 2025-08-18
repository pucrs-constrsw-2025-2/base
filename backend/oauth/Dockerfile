# Stage 1: Build - Instala dependências com Poetry
FROM python:3.12-slim as builder

WORKDIR /app

# Instala o Poetry para gerenciar o projeto
RUN pip install poetry

# Copia os arquivos de definição de projeto e dependências
COPY poetry.lock pyproject.toml ./

# Configura o Poetry para instalar as dependências no ambiente do sistema, não em um venv
# Instala apenas as dependências de produção, otimizando a imagem final
RUN poetry config virtualenvs.create false && poetry install --no-dev --no-interaction --no-ansi

# Stage 2: Final - Cria a imagem de produção enxuta
FROM python:3.12-slim

WORKDIR /app

# Copia as dependências instaladas no stage anterior
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages

# Copia o código-fonte da aplicação
COPY ./oauth_api ./oauth_api

# Expõe a porta em que a aplicação será executada
EXPOSE 80