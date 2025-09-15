# Estágio de build
FROM node:18-alpine AS builder

# Argumento para injetar a URL do gateway no build do Vite
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

# Estágio de produção com nginx
FROM nginx:1.28.0-alpine
WORKDIR /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/build/ /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]