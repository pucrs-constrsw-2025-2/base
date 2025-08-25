# Gateway Keycloak

Este serviço atua como gateway autenticador utilizando Keycloak.

## Como rodar

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Execute o serviço:
   ```bash
   npm start
   ```
3. Para rodar com Docker:
   ```bash
   docker build -t keycloak-gateway .
   docker run -p 3000:3000 keycloak-gateway
   ```

## Rotas
- `/public`: rota aberta
- `/secure`: rota protegida pelo Keycloak

## Como rodar os testes

1. Instale as dependências de desenvolvimento:
   ```bash
   npm install
   ```

2. Execute os testes unitários:
   ```bash
   npm test
   ```
   ou
   ```bash
   npx jest
   ```

Os testes estão localizados na pasta `__tests__` e utilizam Jest com suporte a TypeScript via `ts-jest`.