# Mapeamento de Serviços: Docker Compose → AWS

Este documento mapeia cada serviço da arquitetura atual (Docker Compose) para os serviços AWS recomendados.

---

## 🔄 Mapeamento Direto

### Frontend

| Serviço Atual | Serviço AWS Recomendado | Observações |
|---------------|------------------------|-------------|
| `frontend` (React + Nginx) | **Amazon S3 + CloudFront** | Build estático do React no S3, CloudFront como CDN |

**Alternativa**: AWS Amplify (solução mais gerenciada)

---

### Backend - BFF

| Serviço Atual | Serviço AWS Recomendado | Observações |
|---------------|------------------------|-------------|
| `bff` (Node.js/NestJS) | **Amazon EKS** | Deployment no Kubernetes, exposto via API Gateway ou ALB |

**Configuração sugerida**:
- Deployment com recursos: 0.5 vCPU, 1GB RAM
- HorizontalPodAutoscaler (HPA): 2-10 replicas
- Service e Ingress configurados
- Health checks (liveness/readiness probes)

---

### Backend - Microserviços

| Serviço Atual | Tecnologia | Serviço AWS Recomendado | Observações |
|---------------|-----------|------------------------|-------------|
| `oauth` | Python/FastAPI | **Amazon EKS** | Deployment no Kubernetes |
| `employees` | Java/Spring Boot | **Amazon EKS** | Deployment no Kubernetes |
| `classes` | .NET/C# | **Amazon EKS** | Deployment no Kubernetes |
| `courses` | Python/FastAPI | **Amazon EKS** | Deployment no Kubernetes |
| `lessons` | Node.js/NestJS | **Amazon EKS** | Deployment no Kubernetes |
| `professors` | Python/FastAPI | **Amazon EKS** | Deployment no Kubernetes |
| `reservations` | Node.js/NestJS | **Amazon EKS** | Deployment no Kubernetes |
| `resources` | Node.js/NestJS | **Amazon EKS** | Deployment no Kubernetes |
| `rooms` | Node.js/NestJS | **Amazon EKS** | Deployment no Kubernetes |
| `students` | .NET/C# | **Amazon EKS** | Deployment no Kubernetes |

**Configuração sugerida para cada microserviço**:
- Deployment com recursos: 0.25-0.5 vCPU, 512MB-1GB RAM
- HorizontalPodAutoscaler (HPA): 1-5 replicas por serviço
- Service e Ingress configurados
- Health checks (liveness/readiness probes)
- Service Discovery via Kubernetes DNS

---

### Bancos de Dados

| Serviço Atual | Serviço AWS Recomendado | Observações |
|---------------|------------------------|-------------|
| `postgresql` | **Amazon RDS PostgreSQL** | Multi-AZ para produção, Single-AZ para dev/test |
| `mongodb` | **Amazon DocumentDB** | Compatível com MongoDB, totalmente gerenciado |

**Configuração escolhida (custo otimizado)**:
- **RDS PostgreSQL**:
  - Instância: db.t3.micro (menor instância possível)
  - Multi-AZ: ❌ Não (reduz custos)
  - Backup automático: ❌ Desabilitado (reduz custos)
  - Encryption at rest: ❌ Desabilitado (reduz custos)
  - VPC: ✅ Isolamento em sub-rede privada
  - Security Groups: Configurados para permitir apenas tráfego do EKS

- **DocumentDB**:
  - Instância: db.t3.medium (menor instância possível)
  - Cluster: 1 instância (sem réplicas)
  - Backup automático: ❌ Desabilitado (reduz custos)
  - Multi-AZ: ❌ Desabilitado (reduz custos)
  - Escalabilidade automática: ❌ Desabilitado (reduz custos)
  - VPC: ✅ Isolamento em sub-rede privada
  - Security Groups: Configurados para permitir apenas tráfego do EKS

---

### Autenticação e Autorização

| Serviço Atual | Serviço AWS Recomendado | Observações |
|---------------|------------------------|-------------|
| `keycloak` | **Keycloak no EKS** ⭐ ESCOLHIDO | Manter Keycloak no Kubernetes |

**Configuração escolhida**:
- Executar Keycloak como Deployment no EKS
- Usar RDS PostgreSQL para persistência (banco dedicado ou compartilhado)
- Configurar Service e Ingress para exposição
- Configurar PersistentVolume para dados do Keycloak (se necessário)
- Health checks (liveness/readiness probes) configurados
- Namespace: infrastructure (separado dos microserviços)

---

### Observabilidade e Monitoramento

| Serviço Atual | Serviço AWS Recomendado | Observações |
|---------------|------------------------|-------------|
| `prometheus` | **Prometheus no EKS + Amazon Managed Service for Prometheus** ⭐ ESCOLHIDO | Manter Prometheus com armazenamento gerenciado |
| `otel-collector` | **Manter ou remover** | OpenTelemetry Collector pode ser mantido no EKS ou removido |
| `blackbox-exporter` | **Blackbox Exporter no EKS** | Manter no EKS se necessário |

**Configuração escolhida**:
- **Prometheus**: Executar como Deployment no EKS
- **Amazon Managed Service for Prometheus**: Backend de armazenamento gerenciado
- **Grafana**: Opcional, no EKS para visualização
- **CloudWatch Logs**: Agregação de logs (via Fluent Bit/Fluentd)
- **CloudWatch Metrics**: Métricas complementares
- **CloudWatch Alarms**: Alertas baseados em métricas

---

### Qualidade de Código

| Serviço Atual | Serviço AWS Recomendado | Observações |
|---------------|------------------------|-------------|
| `sonarqube` | **SonarQube no EKS** ⭐ ESCOLHIDO | Manter SonarQube no Kubernetes |

**Configuração escolhida**:
- Executar SonarQube como Deployment no EKS
- Usar RDS PostgreSQL para persistência (banco dedicado ou compartilhado)
- Configurar Service e Ingress para acesso
- Configurar PersistentVolume para dados do SonarQube
- Health checks (liveness/readiness probes) configurados
- Namespace: infrastructure (separado dos microserviços)

---

### Infraestrutura de Rede

| Componente Atual | Serviço AWS Recomendado | Observações |
|------------------|------------------------|-------------|
| Docker Network (`constrsw`) | **Amazon VPC** | Isolamento de rede, subnets públicas/privadas |
| Portas expostas | **Application Load Balancer (ALB)** | Balanceamento de carga, SSL termination |
| - | **API Gateway** | Gerenciamento de APIs, rate limiting |
| - | **NAT Gateway** | Acesso à internet de recursos privados |
| - | **Security Groups** | Segregação de tráfego entre serviços |

**Configuração escolhida**:
- **VPC**: 1 VPC dedicada para produção
- **Subnets**: 
  - **Públicas**: Para ALB, NAT Gateway, recursos que precisam de acesso à internet
  - **Privadas**: Para EKS nodes, RDS, DocumentDB, ElastiCache (isolamento completo)
- **NAT Gateway**: Para permitir que recursos em subnets privadas acessem a internet
- **Security Groups**: 
  - Security Group para EKS nodes
  - Security Group para RDS (apenas tráfego do EKS)
  - Security Group para DocumentDB (apenas tráfego do EKS)
  - Security Group para ElastiCache (apenas tráfego do EKS)
- **ALB**: 
  - ALB público para BFF (via API Gateway)
  - ALB interno para comunicação entre microserviços (opcional)
- **API Gateway**: 
  - HTTP API (mais barato e rápido)
  - Integração com EKS via VPC Link

---

### Armazenamento

| Componente Atual | Serviço AWS Recomendado | Observações |
|------------------|------------------------|-------------|
| Docker Volumes | **PersistentVolumes (EBS)** | Volumes persistentes para containers no EKS |
| - | **Amazon S3** | Apenas para build do frontend (estático) |

**Configuração escolhida**:
- **PersistentVolumes (EBS)**: 
  - Para Keycloak (dados persistentes)
  - Para SonarQube (dados persistentes)
  - StorageClass configurado no EKS
- **S3**: 
  - ✅ Build do frontend (estático)
  - ❌ Não utilizado para uploads de usuários
  - ❌ Não utilizado para backups
  - ❌ Não utilizado para armazenamento de arquivos

---

### Cache

| Componente Atual | Serviço AWS Recomendado | Observações |
|------------------|------------------------|-------------|
| Cache em memória (BFF) | **Amazon ElastiCache (Redis)** | Cache distribuído, sessões de usuário |

**Configuração sugerida**:
- **ElastiCache Redis**:
  - Cluster mode: Sim (alta disponibilidade)
  - Node type: cache.t3.medium (produção) ou cache.t3.micro (dev/test)
  - Backup automático: Sim

---

### CI/CD

| Componente Atual | Serviço AWS Recomendado | Observações |
|------------------|------------------------|-------------|
| Build manual / Scripts | **GitHub Actions / GitLab CI** ⭐ ESCOLHIDO | Pipeline CI/CD no repositório |

**Configuração escolhida**:
- **GitHub Actions** ou **GitLab CI**: Pipeline de CI/CD no repositório
- **AWS SDK/CLI**: Para deploy no EKS
- **kubectl**: Para aplicar manifests Kubernetes
- **Docker Build**: Build de imagens Docker
- **ECR (Elastic Container Registry)**: Registry para imagens Docker
- **Workflow**:
  1. Build das imagens Docker
  2. Push para ECR
  3. Atualizar manifests Kubernetes
  4. Aplicar no cluster EKS via kubectl
  5. Verificar health checks


---

## 📋 Tabela de Decisões

### Decisões Arquiteturais Principais

| Decisão | Opção Escolhida | Justificativa |
|---------|----------------|---------------|
| **Orquestração de Containers** | Amazon EKS | Kubernetes gerenciado, padrão da indústria, maior controle |
| **Banco Relacional** | RDS PostgreSQL (configuração mínima) | Totalmente gerenciado, custo otimizado (sem Multi-AZ, backups, encryption) |
| **Banco NoSQL** | DocumentDB | Compatível com MongoDB, totalmente gerenciado |
| **Autenticação** | Keycloak no EKS | Mantém compatibilidade, controle total |
| **Monitoramento** | Prometheus + Amazon Managed Service for Prometheus | Mantém compatibilidade, armazenamento gerenciado |
| **Frontend** | S3 + CloudFront | CDN global, baixa latência |
| **API Management** | API Gateway | Rate limiting, cache, segurança integrada |
| **CI/CD** | GitHub Actions / GitLab CI | CI/CD no repositório, controle total |
| **Qualidade de Código** | SonarQube no EKS | Mantém compatibilidade, controle total |
| **Armazenamento de Arquivos** | Não utilizado | Apenas S3 para frontend estático |
| **Mensageria** | Não utilizado | Arquitetura síncrona via API REST |

---

## 🔧 Configurações Específicas por Serviço

### Kubernetes Manifests (EKS)

#### BFF Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bff
  namespace: production
spec:
  replicas: 2
  selector:
    matchLabels:
      app: bff
  template:
    metadata:
      labels:
        app: bff
    spec:
      containers:
      - name: bff
        image: <ECR_REGISTRY>/bff:latest
        ports:
        - containerPort: 3000
        resources:
          requests:
            cpu: 500m
            memory: 1Gi
          limits:
            cpu: 1000m
            memory: 2Gi
        livenessProbe:
          httpGet:
            path: /api/v1/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/v1/health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: bff
  namespace: production
spec:
  selector:
    app: bff
  ports:
  - port: 80
    targetPort: 3000
  type: ClusterIP
```

#### Microserviços (exemplo: employees)
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: employees
  namespace: production
spec:
  replicas: 2
  selector:
    matchLabels:
      app: employees
  template:
    metadata:
      labels:
        app: employees
    spec:
      containers:
      - name: employees
        image: <ECR_REGISTRY>/employees:latest
        ports:
        - containerPort: 8080
        resources:
          requests:
            cpu: 250m
            memory: 512Mi
          limits:
            cpu: 500m
            memory: 1Gi
        env:
        - name: MONGODB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: mongodb-secret
              key: password
        livenessProbe:
          httpGet:
            path: /api/v1/health
            port: 8080
          initialDelaySeconds: 40
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: employees
  namespace: production
spec:
  selector:
    app: employees
  ports:
  - port: 80
    targetPort: 8080
  type: ClusterIP
```

### RDS PostgreSQL (Configuração Mínima - Custo Otimizado)

```yaml
Engine: postgres
Version: 15.x
Instance Class: db.t3.micro  # Menor instância possível
Multi-AZ: false  # Desabilitado para reduzir custos
Storage: 20 GB (gp3)  # Mínimo necessário
Backup Retention: 0 days  # Desabilitado para reduzir custos
Encryption: false  # Desabilitado para reduzir custos
Public Access: false
VPC: [VPC ID]
Subnet Group: [Private Subnet Group]  # Isolamento em sub-rede privada
Security Group: [RDS Security Group]  # Apenas tráfego do EKS
```

### DocumentDB (Configuração Mínima - Custo Otimizado)

```yaml
Engine: docdb
Version: 5.0
Instance Class: db.t3.medium  # Menor instância possível
Cluster: 1 instance  # Sem réplicas (reduz custos)
Backup Retention: 0 days  # Desabilitado para reduzir custos
Multi-AZ: false  # Desabilitado para reduzir custos
Auto Scaling: false  # Desabilitado para reduzir custos
Encryption: false  # Opcional (pode ser habilitado se necessário)
Public Access: false
VPC: [VPC ID]
Subnet Group: [Private Subnet Group]  # Isolamento em sub-rede privada
Security Group: [DocumentDB Security Group]  # Apenas tráfego do EKS
```

---

## 🚀 Checklist de Migração por Serviço

### Frontend
- [ ] Build de produção do React
- [ ] Upload para S3
- [ ] Configurar CloudFront distribution
- [ ] Configurar domínio e certificado SSL
- [ ] Testar CDN e cache

### BFF
- [ ] Criar ECR repository
- [ ] Build e push da imagem Docker
- [ ] Criar Task Definition
- [ ] Criar ECS Service
- [ ] Configurar Service Discovery
- [ ] Configurar health checks
- [ ] Testar integração com microserviços

### Microserviços
- [ ] Para cada microserviço:
  - [ ] Criar ECR repository
  - [ ] Build e push da imagem Docker
  - [ ] Criar Task Definition
  - [ ] Criar ECS Service
  - [ ] Configurar variáveis de ambiente
  - [ ] Configurar secrets no Secrets Manager
  - [ ] Configurar health checks
  - [ ] Testar integração com bancos de dados

### Bancos de Dados
- [ ] Criar RDS PostgreSQL
- [ ] Migrar dados do PostgreSQL local
- [ ] Criar DocumentDB cluster
- [ ] Migrar dados do MongoDB local
- [ ] Configurar backups automáticos
- [ ] Testar conectividade dos microserviços

### Autenticação
- [ ] Opção A: Migrar para Cognito
  - [ ] Criar User Pool
  - [ ] Configurar OAuth2/OpenID Connect
  - [ ] Adaptar código OAuth API
- [ ] Opção B: Manter Keycloak
  - [ ] Deploy Keycloak no ECS
  - [ ] Configurar RDS para persistência
  - [ ] Migrar realm do Keycloak

### Monitoramento
- [ ] Configurar CloudWatch Log Groups
- [ ] Configurar CloudWatch Metrics
- [ ] Configurar X-Ray tracing
- [ ] Criar dashboards CloudWatch
- [ ] Configurar alertas
- [ ] Testar observabilidade completa

---

**Última atualização**: Janeiro 2025

