# Dockerfile para o frontend React
FROM node:18-alpine AS builder

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências (incluindo devDependencies para o build)
RUN npm ci --silent

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Estágio de produção com nginx
FROM nginx:alpine

# Copiar arquivos de build
COPY --from=builder /app/build /usr/share/nginx/html

# Copiar configuração customizada do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor porta 80
EXPOSE 80

# Comando para iniciar nginx
CMD ["nginx", "-g", "daemon off;"]
