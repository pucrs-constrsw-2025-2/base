# Stage 1: Build - Instala as dependências de produção com Poetry
FROM python:3.12-slim AS builder

# Define '/app' como o diretório de trabalho DENTRO do contêiner.
WORKDIR /app

# Instala o Poetry
RUN pip install poetry

# Copia os arquivos de definição de projeto e dependências.
COPY poetry.lock pyproject.toml ./

# Configura o Poetry para instalar dependências no ambiente do sistema e instala-as.
# A flag --no-root evita a instalação do projeto local.
RUN poetry config virtualenvs.create false && poetry install --without dev --no-interaction --no-ansi --no-root

# Stage 2: Production - Cria a imagem final otimizada para produção
FROM python:3.12-slim

WORKDIR /app

# Cria um usuário e grupo de sistema 'app' para rodar a aplicação com privilégios mínimos.
RUN addgroup --system app && adduser --system --group app

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

# Expõe a porta 80.
EXPOSE 80

# Comando para iniciar o servidor Uvicorn e executar a aplicação FastAPI.
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]