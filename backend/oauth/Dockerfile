# Usando uma imagem base do Python
FROM python:3.12-slim

# Definir o diretório de trabalho dentro do container
WORKDIR /app

# Copiar os arquivos do seu projeto para o diretório de trabalho no container
COPY . /app

# Instalar as dependências necessárias
RUN pip install --no-cache-dir -r requirements.txt

# Expor a porta em que o FastAPI irá rodar
EXPOSE 8000

# Comando para rodar o servidor Uvicorn (FastAPI)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
