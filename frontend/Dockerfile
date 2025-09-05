# Estágio 1: Build da Aplicação
# Usando a versão LTS mais recente do Node.js (22.x) com base Alpine
FROM node:22-alpine AS builder

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de gerenciamento de pacotes
COPY package.json package-lock.json ./

# Instala as dependências
RUN npm install

# Copia o restante do código-fonte
COPY . .

# Compila a aplicação para produção
RUN npm run build

# Estágio 2: Servidor de Produção
# Usando a versão stable mais recente do Nginx com base Alpine
FROM nginx:1.24-alpine

# Copia os arquivos estáticos gerados no estágio de build
COPY --from=builder /app/build /usr/share/nginx/html


# Expõe a porta 80
EXPOSE 80

# Comando para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]