# Diagrama de Arquitetura - ConstrSW 2025-2

## Visão Geral da Arquitetura

Este documento apresenta o diagrama completo da arquitetura da solução ConstrSW, incluindo todos os componentes, microserviços, bancos de dados e serviços de infraestrutura.

---

## Diagrama de Arquitetura Completo

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                                    CAMADA CLIENTE                                    │
│                                                                                     │
│  ┌──────────────────────────────────────────────────────────────────────────────┐  │
│  │                         Frontend (React + TypeScript)                        │  │
│  │                         Porta: 3000 (externo: 3000)                          │  │
│  └──────────────────────────────────────────────────────────────────────────────┘  │
│                                    │                                               │
│                                    │ HTTP/HTTPS                                    │
│                                    ▼                                               │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                                                 │
                                                                 │
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              CAMADA DE APLICAÇÃO                                     │
│                                                                                     │
│  ┌──────────────────────────────────────────────────────────────────────────────┐  │
│  │                    BFF - Backend for Frontend                                │  │
│  │                    (NestJS + TypeScript)                                     │  │
│  │                    Porta: 3000 (externo: 3000)                               │  │
│  │                                                                               │  │
│  │  • Circuit Breaker (Opossum)                                                 │  │
│  │  • Rate Limiting                                                             │  │
│  │  • Cache (in-memory)                                                         │  │
│  │  • Request Aggregation                                                        │  │
│  └──────────────────────────────────────────────────────────────────────────────┘  │
│                                    │                                               │
│                                    │ HTTP/REST                                     │
│                                    │                                               │
│  ┌─────────────────────────────────┴───────────────────────────────────────────┐  │
│  │                         MICROSERVIÇOS BACKEND                               │  │
│  │                                                                               │  │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐         │  │
│  │  │  OAuth Service   │  │ Employees Service │  │ Students Service  │         │  │
│  │  │  (FastAPI/Python)│  │ (Spring Boot/Java)│  │ (ASP.NET Core/C#) │         │  │
│  │  │  Porta: 8000     │  │  Porta: 8080     │  │  Porta: 5000     │         │  │
│  │  │  Ext: 8180        │  │  Ext: 8185       │  │  Ext: 8190       │         │  │
│  │  └──────────────────┘  └──────────────────┘  └──────────────────┘         │  │
│  │                                                                               │  │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐         │  │
│  │  │ Classes Service   │  │ Courses Service  │  │ Lessons Service   │         │  │
│  │  │ (ASP.NET Core/C#)│  │ (FastAPI/Python) │  │ (NestJS/TypeScript)│        │  │
│  │  │  Porta: 5000     │  │  Porta: 8080     │  │  Porta: 3000      │         │  │
│  │  │  Ext: 8191       │  │  Ext: 8181       │  │  Ext: 8182        │         │  │
│  │  └──────────────────┘  └──────────────────┘  └──────────────────┘         │  │
│  │                                                                               │  │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐         │  │
│  │  │Professors Service │  │Reservations Svc  │  │ Resources Service │         │  │
│  │  │ (FastAPI/Python) │  │ (NestJS/TypeScript)│  │ (NestJS/TypeScript)│        │  │
│  │  │  Porta: 8082     │  │  Porta: 8080     │  │  Porta: 3000      │         │  │
│  │  │  Ext: 8183       │  │  Ext: 8186       │  │  Ext: 8187        │         │  │
│  │  └──────────────────┘  └──────────────────┘  └──────────────────┘         │  │
│  │                                                                               │  │
│  │  ┌──────────────────┐                                                        │  │
│  │  │  Rooms Service    │                                                        │  │
│  │  │ (NestJS/TypeScript)│                                                       │  │
│  │  │  Porta: 3000      │                                                        │  │
│  │  │  Ext: 8188        │                                                        │  │
│  │  └──────────────────┘                                                        │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                    │                                               │
│                                    │                                               │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                          CAMADA DE DADOS E INFRAESTRUTURA                            │
│                                                                                     │
│  ┌──────────────────────────────────────────────────────────────────────────────┐  │
│  │                              BANCOS DE DADOS                                  │  │
│  │                                                                               │  │
│  │  ┌──────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                    PostgreSQL (Porta: 5432)                           │  │  │
│  │  │                                                                        │  │  │
│  │  │  • lessons_db      (Lessons Service)                                   │  │  │
│  │  │  • professors_db   (Professors Service)                                │  │  │
│  │  │  • reservations_db (Reservations Service)                             │  │  │
│  │  │  • rooms_db        (Rooms Service)                                     │  │  │
│  │  │  • students_db     (Students Service)                                  │  │  │
│  │  │  • sonar          (SonarQube)                                         │  │  │
│  │  └──────────────────────────────────────────────────────────────────────┘  │  │
│  │                                    │                                         │  │
│  │  ┌──────────────────────────────────────────────────────────────────────┐  │  │
│  │  │                    MongoDB (Porta: 27017)                              │  │  │
│  │  │                                                                        │  │  │
│  │  │  • employees_db    (Employees Service)                                │  │  │
│  │  │  • classes_db      (Classes Service)                                  │  │  │
│  │  │  • courses_db      (Courses Service)                                  │  │  │
│  │  │  • resources_db    (Resources Service)                                 │  │  │
│  │  └──────────────────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                     │
│  ┌──────────────────────────────────────────────────────────────────────────────┐  │
│  │                        SERVIÇOS DE INFRAESTRUTURA                             │  │
│  │                                                                               │  │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐         │  │
│  │  │    Keycloak      │  │   Prometheus     │  │ OpenTelemetry     │         │  │
│  │  │  (Autenticação)  │  │  (Métricas)      │  │   Collector       │         │  │
│  │  │  Porta: 8080     │  │  Porta: 9090     │  │  Porta: 4317/4318 │         │  │
│  │  │  Ext: 8080       │  │  Ext: 9090       │  │  Ext: 4317/4318   │         │  │
│  │  └──────────────────┘  └──────────────────┘  └──────────────────┘         │  │
│  │         │                                                                     │  │
│  │         │ OAuth Service usa Keycloak                                         │  │
│  │         │                                                                     │  │
│  │  ┌──────────────────┐                                                        │  │
│  │  │   SonarQube       │                                                        │  │
│  │  │ (Qualidade Código)│                                                        │  │
│  │  │  Porta: 9000      │                                                        │  │
│  │  │  Ext: 9000        │                                                        │  │
│  │  └──────────────────┘                                                        │  │
│  │                                                                               │  │
│  │  ┌──────────────────┐  ┌──────────────────┐                                 │  │
│  │  │PostgreSQL Exporter│  │MongoDB Exporter  │                                 │  │
│  │  │  Porta: 9187      │  │  Porta: 9216     │                                 │  │
│  │  └──────────────────┘  └──────────────────┘                                 │  │
│  │                                                                               │  │
│  │  ┌──────────────────┐                                                        │  │
│  │  │ Blackbox Exporter │                                                        │  │
│  │  │  Porta: 9115      │                                                        │  │
│  │  └──────────────────┘                                                        │  │
│  └──────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Fluxo de Comunicação

### 1. Fluxo de Autenticação

```
┌─────────┐         ┌─────────┐         ┌──────────┐         ┌──────────┐
│ Frontend│────────▶│   BFF   │────────▶│  OAuth   │────────▶│ Keycloak │
│         │         │         │         │ Service  │         │          │
└─────────┘         └─────────┘         └──────────┘         └──────────┘
     │                   │                   │                      │
     │                   │                   │                      │
     │◀──────────────────┼───────────────────┼──────────────────────┘
     │    JWT Token      │                   │
     │                   │                   │
```

### 2. Fluxo de Requisição de Dados

```
┌─────────┐         ┌─────────┐         ┌──────────────┐         ┌──────────┐
│ Frontend│────────▶│   BFF   │────────▶│ Microservice │────────▶│ Database │
│         │         │         │         │              │         │          │
└─────────┘         └─────────┘         └──────────────┘         └──────────┘
     │                   │                   │                      │
     │                   │                   │                      │
     │◀──────────────────┼───────────────────┼──────────────────────┘
     │    Response       │                   │
     │                   │                   │
```

### 3. Fluxo de Observabilidade

```
┌──────────────┐         ┌──────────────────┐         ┌──────────┐
│ Microservice │────────▶│ OpenTelemetry    │────────▶│Prometheus│
│              │         │ Collector        │         │          │
└──────────────┘         └──────────────────┘         └──────────┘
     │                           │
     │                           │
     │                           ▼
     │                    ┌──────────┐
     │                    │ Metrics  │
     │                    │ Export   │
     └────────────────────┴──────────┘
```

---

## Mapeamento de Tecnologias por Camada

### Camada de Apresentação
- **Frontend**: React + TypeScript + Vite
- **Servidor Web**: Nginx

### Camada de Aplicação
- **BFF**: NestJS 10.x (TypeScript)
- **Microserviços**:
  - **TypeScript (NestJS)**: Lessons, Reservations, Resources, Rooms
  - **Python (FastAPI)**: OAuth, Courses, Professors
  - **Java (Spring Boot)**: Employees
  - **C# (ASP.NET Core)**: Students, Classes

### Camada de Dados
- **PostgreSQL**: Lessons, Professors, Reservations, Rooms, Students, SonarQube
- **MongoDB**: Employees, Classes, Courses, Resources

### Camada de Infraestrutura
- **Autenticação**: Keycloak + OAuth Service (FastAPI)
- **Observabilidade**: 
  - Prometheus (métricas)
  - OpenTelemetry Collector (rastreamento)
  - Exporters (PostgreSQL, MongoDB, Blackbox)
- **Qualidade**: SonarQube

---

## Detalhamento dos Microserviços

### Microserviços com PostgreSQL

| Serviço | Framework | Porta Interna | Porta Externa | Banco de Dados |
|---------|-----------|---------------|----------------|----------------|
| Lessons | NestJS | 3000 | 8182 | lessons_db |
| Professors | FastAPI | 8082 | 8183 | professors_db |
| Reservations | NestJS | 8080 | 8186 | reservations_db |
| Rooms | NestJS | 3000 | 8188 | rooms_db |
| Students | ASP.NET Core | 5000 | 8190 | students_db |

### Microserviços com MongoDB

| Serviço | Framework | Porta Interna | Porta Externa | Banco de Dados |
|---------|-----------|---------------|----------------|----------------|
| Employees | Spring Boot | 8080 | 8185 | employees_db |
| Classes | ASP.NET Core | 5000 | 8191 | classes_db |
| Courses | FastAPI | 8080 | 8181 | courses_db |
| Resources | NestJS | 3000 | 8187 | resources_db |

### Serviços de Infraestrutura

| Serviço | Tecnologia | Porta Interna | Porta Externa | Descrição |
|---------|------------|----------------|---------------|-----------|
| OAuth | FastAPI | 8000 | 8180 | Gateway de autenticação |
| Keycloak | Java | 8080 | 8080 | Servidor de autenticação |
| Prometheus | Go | 9090 | 9090 | Coleta de métricas |
| OpenTelemetry | Go | 4317/4318 | 4317/4318 | Coleta de traces |
| SonarQube | Java | 9000 | 9000 | Análise de código |

---

## Padrões Arquiteturais Implementados

### 1. **Microserviços**
- Cada serviço é independente e pode ser desenvolvido, testado e implantado separadamente
- Comunicação via HTTP/REST
- Cada serviço possui seu próprio banco de dados

### 2. **Backend for Frontend (BFF)**
- Camada intermediária que agrega chamadas aos microserviços
- Implementa circuit breaker, rate limiting e cache
- Reduz latência e complexidade no frontend

### 3. **API Gateway Pattern**
- OAuth Service atua como gateway de autenticação
- Centraliza validação de tokens JWT

### 4. **Database per Service**
- Cada microserviço possui seu próprio banco de dados
- Isolamento de dados e independência de evolução

### 5. **Observabilidade**
- Métricas coletadas via Prometheus
- Traces coletados via OpenTelemetry
- Health checks em todos os serviços

### 6. **Service Discovery**
- Utiliza Docker Compose networking
- Serviços se comunicam via nomes de containers

---

## Segurança

### Autenticação e Autorização
- **Keycloak**: Servidor de identidade e gerenciamento de acesso
- **OAuth Service**: Gateway que valida tokens JWT
- **JWT Tokens**: Usados para autenticação entre serviços

### Proteção de Endpoints
- Todos os endpoints (exceto health e metrics) requerem autenticação
- Validação de token via OAuth Service
- Rate limiting no BFF

---

## Observabilidade

### Métricas
- **Prometheus**: Coleta métricas de todos os serviços
- **Exporters**: PostgreSQL, MongoDB, Blackbox
- **Métricas customizadas**: Cada serviço expõe `/api/v1/metrics`

### Traces
- **OpenTelemetry Collector**: Coleta traces de todos os serviços
- **Instrumentação automática**: Configurada em cada serviço

### Health Checks
- Todos os serviços expõem `/api/v1/health`
- Monitoramento via Blackbox Exporter

---

## Comunicação Entre Serviços

### Comunicação Síncrona
- **HTTP/REST**: Comunicação entre BFF e microserviços
- **Timeout configurável**: 5 segundos padrão
- **Circuit Breaker**: Implementado no BFF

### Comunicação Assíncrona
- **Eventos**: Preparado para implementação futura
- **Message Queue**: Não implementado na versão atual

---

## Escalabilidade

### Horizontal Scaling
- Todos os serviços são stateless (exceto Keycloak)
- Podem ser escalados horizontalmente
- Load balancing via Docker Compose (preparado para Kubernetes)

### Vertical Scaling
- Recursos configuráveis por serviço
- Health checks garantem disponibilidade

---

## Deploy e Infraestrutura

### Containerização
- Todos os serviços são containerizados com Docker
- Docker Compose para orquestração local
- Preparado para Kubernetes (EKS)

### Volumes Persistentes
- PostgreSQL: `constrsw-postgresql-data`
- MongoDB: `constrsw-mongodb-data`
- Keycloak: `constrsw-keycloak-data`
- Prometheus: `constrsw-prometheus-data`
- SonarQube: `constrsw-sonarqube-data`

---

## Resumo de Tecnologias

### Linguagens de Programação
- **TypeScript**: 5 serviços (BFF, Lessons, Reservations, Resources, Rooms)
- **Python**: 3 serviços (OAuth, Courses, Professors)
- **Java**: 1 serviço (Employees)
- **C#**: 2 serviços (Students, Classes)

### Frameworks Web
- **NestJS**: 5 serviços
- **FastAPI**: 3 serviços
- **Spring Boot**: 1 serviço
- **ASP.NET Core**: 2 serviços

### Bancos de Dados
- **PostgreSQL**: 6 bancos (5 serviços + SonarQube)
- **MongoDB**: 4 bancos

### Ferramentas de Infraestrutura
- **Docker**: Containerização
- **Docker Compose**: Orquestração
- **Keycloak**: Autenticação
- **Prometheus**: Métricas
- **OpenTelemetry**: Observabilidade
- **SonarQube**: Qualidade de código

---

## Notas Finais

Esta arquitetura segue os princípios de:
- **Microserviços**: Serviços independentes e desacoplados
- **API-First**: Todas as APIs documentadas com OpenAPI/Swagger
- **Observability**: Métricas, logs e traces em todos os serviços
- **Security**: Autenticação centralizada via Keycloak
- **Scalability**: Preparado para escalar horizontalmente
- **Resilience**: Circuit breakers e health checks implementados

