<<<<<<< HEAD
# base
Repositório base da aplicação Closed CRAS

## Como rodar o docker

### Adicionar volumes
   ```bash
   docker volume create constrsw-sonarqube-data
   ```
   ```bash
   docker volume create constrsw-sonarqube-extensions 
   ```

   ```bash
   docker volume create constrsw-sonarqube-logs
   ```

   ```bash
   docker volume create constrsw-postgresql-data
   ```

   ```bash
   docker volume create constrsw-keycloak-data
   ```

### Rodar o docker compose

   ```bash
   docker compose up
   ```

### Remover tudo do docker

   ```bash
   docker system prune -a --volumes -f
   ```
=======
# Closed CRAS 2025-2

Sistema de Gestão de Recursos Computacionais desenvolvido para a disciplina de Construção de Software - PUCRS 2025-2.

## 📋 Sobre o Projeto

O Closed CRAS é um sistema completo para gerenciamento de recursos computacionais de uma universidade, incluindo:

- **Frontend**: Interface web desenvolvida em React + TypeScript
- **Backend**: API REST com autenticação OAuth2/Keycloak
- **Banco de Dados**: PostgreSQL
- **Análise de Código**: SonarQube
- **Autenticação**: Keycloak

## 🚀 Tecnologias Utilizadas

### Frontend
- React 18.3.1 + TypeScript
- Vite + Tailwind CSS
- shadcn/ui + Radix UI
- React Hook Form + Sonner

### Backend
- Java Spring Boot
- PostgreSQL
- Keycloak (OAuth2/OpenID Connect)
- SonarQube

## 🛠️ Instalação e Execução

### Pré-requisitos

- Docker e Docker Compose
- Node.js 18+ (para desenvolvimento local do frontend)
- Java 17+ (para desenvolvimento local do backend)

### Execução com Docker (Recomendado)

1. **Clone o repositório**:
```bash
git clone <repository-url>
cd constrsw-2025-2
```

2. **Configure as variáveis de ambiente**:
```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite as variáveis conforme necessário
nano .env
```

3. **Execute o sistema completo**:
```bash
# Linux/Mac
./build-frontend.sh

# Windows PowerShell
.\build-frontend.ps1

# Ou manualmente
docker-compose up -d
```

4. **Acesse os serviços**:
- **Frontend**: http://localhost:3000
- **Keycloak**: http://localhost:8001
- **SonarQube**: http://localhost:9000
- **PostgreSQL**: localhost:5432

### Desenvolvimento Local

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

#### Backend
```bash
cd backend
./mvnw spring-boot:run
```

## 🔐 Autenticação

O sistema utiliza Keycloak para autenticação. Credenciais padrão:

- **Admin Keycloak**: admin / a12345678
- **Usuários de teste**: Ver documentação do frontend

## 📁 Estrutura do Projeto

```
constrsw-2025-2/
├── frontend/              # Aplicação React
│   ├── src/
│   ├── Dockerfile
│   └── README.md
├── backend/               # API REST
│   ├── oauth/
│   └── utils/
├── docker-compose.yml     # Orquestração dos serviços
├── .env                   # Variáveis de ambiente
└── README.md             # Este arquivo
```

## 📚 Documentação

- [Frontend README](./frontend/README.md) - Documentação detalhada do frontend
- [Autenticação](./frontend/AUTHENTICATION.md) - Estratégias de autenticação
- [Postman Collections](./ConstrSW.postman_collection.json) - API endpoints

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 👥 Equipe

Desenvolvido para a disciplina de Construção de Software - PUCRS 2025-2.

---

**Última atualização**: Janeiro 2025
>>>>>>> 4cbdd50e1455e268dd0d3da4e052f4a35bbf6e95
