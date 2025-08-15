# base

Repositório base da aplicação Closed CRAS

# Como rodar isso aqui pela primeira vez

Rodar o comando para criar o volume externo

```
docker volume create constrsw-keycloak-data
```

Depois para subir rodar

```
docker-compose up -d keycloak
```

Vai instalar um bilhão de coisas mas é normal, o resultado que queremos é

```
#11 resolving provenance for metadata file
#11 DONE 0.0s
[+] Running 3/3
 ✔ constrsw/keycloak          Built                                                                                                                                                                                    0.0s
 ✔ Network constrsw_constrsw  Created                                                                                                                                                                                  0.0s
 ✔ Container keycloak         Started
```

Não consegui tornar um usuario admin kkkkkkkkk pqp

------
# Explicação do docker file do backend

Ele tá construindo e rodando o backend nest em duas etapas para deixar a imagem final mais leve

## 1️⃣ Primeira etapa: Desenvolvimento (`development`)

1. **Base:** Usa a imagem `node:20-alpine` (Node.js 20 numa versão leve do Linux).
2. **Diretório:** Define `/usr/src/app` como pasta de trabalho.
3. **Dependências:** Copia `package.json` e `package-lock.json` e instala todas as dependências (`npm install`).
4. **Código:** Copia o código-fonte para dentro do container.
5. **Build:** Roda `npm run build` para gerar os arquivos prontos para produção na pasta `dist`.

---

## 2️⃣ Segunda fase: Produção (`production`)

1. **Base limpa:** Começa outra vez com `node:20-alpine` para não carregar arquivos desnecessários.
2. **Variável de ambiente:** Define `NODE_ENV=production`.
3. **Dependências de produção:** Copia `package.json` e instala só as dependências necessárias para rodar (`npm install --only=production`).
4. **Build final:** Copia a pasta `dist` da fase de desenvolvimento para essa fase.
5. **Comando inicial:** Quando o container inicia, ele roda `node dist/main` para iniciar a aplicação.

---

## 💡 Resumo

- **Primeira fase:** constrói o projeto (compila TypeScript → JavaScript).
- **Segunda fase:** pega só o necessário para rodar e deixa a imagem final mais leve.
- **Vantagens:** imagem menor, mais rápida e mais segura.
"""

----

# E agora?

Depois de criar o dockerfile do nosso backend e pedir pro chat gpt explicar o que tava acontecendo
eu adicionei o nosso backend dentro do compose.yml na raiz do projeto. O que ele faz ta explicando
nos comentarios

```
    container_name: oauth-api
    build:
      context: ./backend/oauth # Caminho para o seu projeto NestJS
      dockerfile: Dockerfile
    image: constrsw/oauth-api
    ports:
      - "3000:3000" # Mapeia a porta do container para a porta do seu host
    environment:
      # Passar variáveis do .env para a API
      - KEYCLOAK_BASE_URL=${KEYCLOAK_INTERNAL_PROTOCOL}://${KEYCLOAK_INTERNAL_HOST}:${KEYCLOAK_INTERNAL_API_PORT}
      - KEYCLOAK_REALM=${KEYCLOAK_REALM}
      - KEYCLOAK_CLIENT_ID=${KEYCLOAK_CLIENT_ID}
      - KEYCLOAK_CLIENT_SECRET=${KEYCLOAK_CLIENT_SECRET}
      - KEYCLOAK_GRANT_TYPE=${KEYCLOAK_GRANT_TYPE}
    networks:
      - constrsw
    depends_on:
      keycloak: # Garante que o Keycloak inicie antes da sua API
        condition: service_healthy # Espera o healthcheck do Keycloak passar
    restart: always
```