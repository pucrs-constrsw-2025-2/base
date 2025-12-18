# Stage 1: Build - Instala as dependências de produção com Poetry
FROM python:3.12-slim AS builder

# Define '/app' como o diretório de trabalho DENTRO do contêiner.
WORKDIR /app

# Instala toolchain para compilar dependências nativas (uvloop/httptools)
RUN apt-get update && \
    apt-get install -y --no-install-recommends build-essential gcc python3-dev && \
    rm -rf /var/lib/apt/lists/*

# Instala o Poetry
RUN pip install poetry

# Copia os arquivos de definição de projeto e dependências.
COPY pyproject.toml ./
# Copia o lockfile se existir, caso contrário será gerado
COPY poetry.lock* ./

# Configura o Poetry para instalar dependências no ambiente do sistema
RUN poetry config virtualenvs.create false

# Atualiza o lock file se necessário e instala as dependências
RUN (poetry lock --no-interaction --no-ansi || true) && \
    poetry install --without dev --no-interaction --no-ansi --no-root

# Stage 2: Production - Cria a imagem final otimizada para produção
FROM python:3.12-slim AS final

WORKDIR /app

RUN apt-get update && \
    # Instala o curl para que o healthcheck possa funcionar
    apt-get install -y curl && \
    # Cria um usuário e grupo de sistema 'app' para rodar a aplicação com privilégios mínimos.
    addgroup --system app && \
    adduser --system --group app && \
    rm -rf /var/lib/apt/lists/*


# Copia os pacotes Python instalados no stage 'builder'.
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages

# --- LINHA ADICIONADA ---
# Copia os executáveis (como o 'uvicorn') instalados pelo Poetry no stage 'builder'.
# Eles são necessários para que o comando CMD possa encontrar e executar o servidor.
COPY --from=builder /usr/local/bin /usr/local/bin

# Copia o código-fonte da sua aplicação.
COPY ./src ./src

# Define o usuário 'app' como o usuário que irá rodar a aplicação.
USER app

# Expõe a porta da aplicação e a porta de debug
EXPOSE 80
EXPOSE 5678

# Comando para iniciar o servidor Uvicorn e executar a aplicação FastAPI.
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]