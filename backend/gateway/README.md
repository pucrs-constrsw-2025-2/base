# Gateway Keycloak

Este serviço atua como gateway autenticador utilizando Keycloak.

# Nome do Projeto

Descrição breve do projeto.

## 📂 Estrutura do Projeto

### API Gateway

```
backend/
  gateway/
    src/
    package.json
    ...
```

## 🚀 Como rodar o projeto

### Rodar o projeto sem build 

1. Acesse a pasta do gateway:

   ```bash
   cd backend/gateway
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Inicie o servidor em modo de desenvolvimento:

   ```bash
   npm run dev
   ```

O servidor será iniciado e estará disponível para uso.

### Rodar o projeto com build 

1. Acesse a pasta do gateway:

   ```bash
   cd backend/gateway
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Execute o serviço:
   ```bash
   npm start
   ```
4. Para rodar com Docker:
   ```bash
   docker build -t keycloak-gateway .
   docker run -p 3000:3000 keycloak-gateway
   ```

### Rotas
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

## 📝 Observações

* Certifique-se de ter o Node.js e npm instalados.
* Configure as variáveis de ambiente necessárias antes de rodar o projeto.