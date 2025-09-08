# Guia de Desenvolvimento - Closed CRAS 2025-2

Este documento fornece instruções detalhadas para desenvolvimento local e deployment do sistema Closed CRAS.

## 🚀 Início Rápido

### 1. Configuração Inicial

```bash
# Clone o repositório
git clone <repository-url>
cd constrsw-2025-2

# Configure as variáveis de ambiente
cp .env.example .env

# Edite as variáveis conforme necessário
nano .env  # ou use seu editor preferido
```

### 2. Execução com Docker (Recomendado)

```bash
# Linux/Mac
./build-frontend.sh

# Windows PowerShell
.\build-frontend.ps1

# Ou manualmente
docker-compose up -d
```

### 3. Verificar Serviços

```bash
# Verificar status dos containers
docker-compose ps

# Ver logs em tempo real
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f frontend
```

## 🛠️ Desenvolvimento Local

### Frontend (React + TypeScript)

```bash
cd frontend

# Instalar dependências
npm install

# Executar em modo desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

**URLs de desenvolvimento:**
- Frontend: http://localhost:3000
- Hot reload ativo

### Backend (Spring Boot)

```bash
cd backend

# Executar aplicação
./mvnw spring-boot:run

# Ou com Maven
mvn spring-boot:run
```

**URLs de desenvolvimento:**
- API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html

## 🐳 Docker

### Comandos Úteis

```bash
# Build de um serviço específico
docker-compose build frontend

# Rebuild forçado
docker-compose build --no-cache frontend

# Executar comando em container
docker-compose exec frontend sh

# Ver logs de um serviço
docker-compose logs -f frontend

# Parar todos os serviços
docker-compose down

# Parar e remover volumes
docker-compose down -v
```

### Volumes Externos

Antes de executar pela primeira vez, crie os volumes necessários:

```bash
# Volumes do Keycloak
docker volume create constrsw-keycloak-data

# Volumes do PostgreSQL
docker volume create constrsw-postgresql-data

# Volumes do SonarQube
docker volume create constrsw-sonarqube-data
docker volume create constrsw-sonarqube-extensions
docker volume create constrsw-sonarqube-logs
```

## 🔧 Configuração

### Variáveis de Ambiente

#### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:8080/api
VITE_KEYCLOAK_URL=http://localhost:8001
VITE_KEYCLOAK_REALM=constrsw
VITE_KEYCLOAK_CLIENT_ID=constrsw-frontend
```

#### Backend (application.yml)
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/postgres
    username: postgres
    password: a12345678
```

### Portas Utilizadas

| Serviço | Porta Externa | Porta Interna | URL |
|---------|---------------|---------------|-----|
| Frontend | 3000 | 80 | http://localhost:3000 |
| Keycloak | 8001 | 8080 | http://localhost:8001 |
| PostgreSQL | 5432 | 5432 | localhost:5432 |
| SonarQube | 9000 | 9000 | http://localhost:9000 |

## 🔐 Autenticação

### Keycloak

**Credenciais padrão:**
- Usuário: `admin`
- Senha: `a12345678`

**Realm:** `constrsw`
**Client ID:** `constrsw-frontend`

### Usuários de Teste

Para testar diferentes perfis no frontend:

- `admin_*` - Perfil Administrador
- `coord_*` - Perfil Coordenador
- `prof_*` - Perfil Professor
- `*` - Perfil Aluno (padrão)

## 🧪 Testes

### Frontend

```bash
cd frontend

# Executar testes
npm test

# Executar testes com coverage
npm run test:coverage

# Executar testes em modo watch
npm run test:watch
```

### Backend

```bash
cd backend

# Executar testes
./mvnw test

# Executar testes com coverage
./mvnw jacoco:report
```

## 📊 Qualidade de Código

### SonarQube

1. Acesse http://localhost:9000
2. Login: admin / a12345678
3. Configure o projeto
4. Execute análise de código

### Linting

#### Frontend
```bash
cd frontend

# ESLint
npm run lint

# Prettier
npm run format
```

#### Backend
```bash
cd backend

# Checkstyle
./mvnw checkstyle:check

# SpotBugs
./mvnw spotbugs:check
```

## 🚀 Deploy

### Produção

```bash
# Build de produção
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

### Staging

```bash
# Build para staging
docker-compose -f docker-compose.staging.yml build

# Deploy para staging
docker-compose -f docker-compose.staging.yml up -d
```

## 🐛 Troubleshooting

### Problemas Comuns

#### Frontend não carrega
```bash
# Verificar se o container está rodando
docker-compose ps frontend

# Ver logs
docker-compose logs frontend

# Rebuild
docker-compose build --no-cache frontend
```

#### Keycloak não inicia
```bash
# Verificar logs
docker-compose logs keycloak

# Verificar se o volume existe
docker volume ls | grep keycloak

# Recriar volume se necessário
docker volume rm constrsw-keycloak-data
docker volume create constrsw-keycloak-data
```

#### PostgreSQL não conecta
```bash
# Verificar se está rodando
docker-compose ps postgresql

# Testar conexão
docker-compose exec postgresql psql -U postgres -d postgres
```

### Logs Úteis

```bash
# Todos os serviços
docker-compose logs

# Serviço específico
docker-compose logs frontend
docker-compose logs keycloak
docker-compose logs postgresql
docker-compose logs sonarqube

# Logs em tempo real
docker-compose logs -f

# Últimas 100 linhas
docker-compose logs --tail=100
```

## 📚 Recursos Adicionais

- [Documentação do Frontend](./frontend/README.md)
- [Estratégias de Autenticação](./frontend/AUTHENTICATION.md)
- [Collection Postman](./ConstrSW.postman_collection.json)
- [Environment Postman](./ConstrSW.postman_environment.json)

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

### Padrões de Commit

```
feat: adiciona nova funcionalidade
fix: corrige bug
docs: atualiza documentação
style: formatação de código
refactor: refatoração de código
test: adiciona ou corrige testes
chore: tarefas de manutenção
```

---

**Última atualização**: Janeiro 2025
