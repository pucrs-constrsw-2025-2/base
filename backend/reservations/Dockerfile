# Dockerfile para aplicação NestJS Reservations
FROM node:20-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Produção
FROM node:20-alpine as prod
WORKDIR /app
COPY --from=build /app/package*.json ./
COPY --from=build /app/dist ./dist
RUN npm install --omit=dev --ignore-scripts

ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "dist/main.js"]
