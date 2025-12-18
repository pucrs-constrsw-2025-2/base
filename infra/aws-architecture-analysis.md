# Análise de Arquitetura AWS - Closed CRAS 2025-2

## 📋 Visão Geral da Arquitetura Atual

O sistema Closed CRAS é uma aplicação de **microserviços** para gestão de recursos computacionais universitários, composta por:

### Componentes Principais

1. **Frontend**: React + TypeScript (SPA)
2. **BFF (Backend for Frontend)**: Node.js/NestJS
3. **Microserviços Backend** (10 serviços):
   - OAuth API (Python/FastAPI)
   - Employees API (Java/Spring Boot)
   - Classes API (.NET/C#)
   - Courses API (Python/FastAPI)
   - Lessons API (Node.js/NestJS)
   - Professors API (Python/FastAPI)
   - Reservations API (Node.js/NestJS)
   - Resources API (Node.js/NestJS)
   - Rooms API (Node.js/NestJS)
   - Students API (.NET/C#)

4. **Bancos de Dados**:
   - PostgreSQL (múltiplos bancos)
   - MongoDB (múltiplos bancos)

5. **Serviços de Infraestrutura**:
   - Keycloak (Autenticação/Authorization)
   - Prometheus (Monitoramento)
   - OpenTelemetry Collector (Observabilidade)
   - SonarQube (Qualidade de Código)

---

## 🏗️ Arquitetura AWS Recomendada

### 1. **Computação e Orquestração**

#### **Amazon EKS (Elastic Kubernetes Service)** ⭐ ESCOLHIDO
- **Uso**: Executar todos os microserviços e serviços de infraestrutura
- **Benefícios**:
  - Kubernetes gerenciado pela AWS
  - Maior controle e flexibilidade
  - Padrão da indústria para orquestração de containers
  - Suporte a múltiplas linguagens (Node.js, Python, Java, .NET)
  - Escalabilidade automática com Horizontal Pod Autoscaler (HPA)
  - Service Discovery nativo do Kubernetes
  - Isolamento de segurança com Network Policies
- **Configuração Sugerida**:
  - Cluster EKS dedicado para produção
  - Node Groups com instâncias EC2 (ou Fargate profiles opcional)
  - Namespaces para organização (produção, desenvolvimento, infraestrutura)
  - Ingress Controller (NGINX ou AWS Load Balancer Controller)
  - Auto Scaling baseado em CPU/Memória/Request Count
  - RBAC (Role-Based Access Control) configurado

---

### 2. **Frontend e CDN**

#### **Amazon S3 + Amazon CloudFront** ⭐ RECOMENDADO
- **S3**: Armazenar arquivos estáticos do React (build de produção)
- **CloudFront**: CDN global para distribuição de conteúdo
- **Benefícios**:
  - Baixa latência global
  - Redução de custos de transferência
  - HTTPS automático
  - Cache inteligente
  - Integração com AWS WAF para segurança

#### **Alternativa: AWS Amplify**
- **Uso**: Se preferir uma solução mais gerenciada
- **Benefícios**: CI/CD integrado, hospedagem automática, SSL gratuito
- **Ideal para**: Projetos que precisam de deploy rápido

---

### 3. **Bancos de Dados**

#### **Amazon RDS (Relational Database Service) - PostgreSQL** ⭐ ESCOLHIDO
- **Uso**: Todos os microserviços que usam PostgreSQL
- **Configuração Escolhida (Custo Otimizado)**:
  - **Instância**: Menor instância possível (db.t3.micro ou db.t4g.micro)
  - **Multi-AZ Deployment**: ❌ Desabilitado (reduz custos)
  - **Read Replicas**: ❌ Não utilizado (reduz custos)
  - **Automated Backups**: ❌ Desabilitado (reduz custos)
  - **Encryption at Rest**: ❌ Desabilitado (reduz custos)
  - **VPC**: ✅ Isolamento de rede em sub-rede privada
  - **Security Groups**: Configurados para permitir apenas tráfego do EKS
- **Opções de Instância**:
  - **db.t3.micro** (1 vCPU, 1GB RAM) - menor custo
  - **db.t4g.micro** (ARM-based, ainda mais econômico)

#### **Amazon DocumentDB (compatível com MongoDB)** ⭐ ESCOLHIDO
- **Uso**: Microserviços que usam MongoDB (Employees, Classes, Courses, Resources)
- **Configuração Escolhida (Custo Otimizado)**:
  - **Instância**: Menor instância possível (db.t3.medium ou db.t4g.medium)
  - **Backup automático**: ❌ Desabilitado (reduz custos)
  - **Multi-AZ**: ❌ Desabilitado (reduz custos)
  - **Escalabilidade automática**: ❌ Desabilitado (reduz custos)
  - **Cluster**: 1 instância (sem réplicas)
  - **VPC**: ✅ Isolamento de rede em sub-rede privada
  - **Security Groups**: Configurados para permitir apenas tráfego do EKS
- **Benefícios**:
  - Totalmente gerenciado (sem gerenciamento de servidores)
  - Compatível com drivers MongoDB existentes
  - Custo otimizado com configuração mínima

#### **Alternativa: MongoDB Atlas na AWS**
- **Uso**: Se preferir MongoDB nativo
- **Benefícios**: Funcionalidades completas do MongoDB
- **Desvantagens**: Gerenciado por terceiro (MongoDB Inc.)

---

### 4. **Autenticação e Autorização**

#### **Keycloak no EKS** ⭐ ESCOLHIDO
- **Uso**: Manter Keycloak para autenticação/authorização
- **Configuração**:
  - Executar Keycloak como Deployment no EKS
  - Usar RDS PostgreSQL para persistência (banco dedicado ou compartilhado)
  - Configurar Service e Ingress para exposição
  - Configurar PersistentVolume para dados do Keycloak (se necessário)
  - Health checks configurados
- **Benefícios**:
  - Mantém compatibilidade com código existente
  - Controle total sobre configuração
  - Flexibilidade para customizações

---

### 5. **API Gateway e Load Balancing**

#### **Amazon API Gateway** ⭐ RECOMENDADO
- **Uso**: Gerenciar APIs dos microserviços
- **Benefícios**:
  - Rate limiting integrado
  - Throttling automático
  - Cache de respostas
  - Transformação de requisições/respostas
  - Integração com AWS WAF
  - Versionamento de APIs
  - Documentação automática (Swagger/OpenAPI)
- **Configuração**:
  - REST API ou HTTP API (HTTP API é mais barato e rápido)
  - Integração com ECS via VPC Link
  - Autenticação via Cognito

#### **Application Load Balancer (ALB)** ⭐ RECOMENDADO
- **Uso**: Balanceamento de carga interno entre microserviços
- **Benefícios**:
  - Health checks automáticos
  - SSL/TLS termination
  - Routing baseado em path/host
  - Integração com ECS
  - WebSocket support
- **Configuração**:
  - ALB interno para comunicação entre serviços
  - ALB público para BFF (se necessário)

---

### 6. **Observabilidade e Monitoramento**

#### **Amazon Managed Service for Prometheus** ⭐ ESCOLHIDO
- **Uso**: Manter Prometheus para monitoramento
- **Configuração**:
  - Prometheus executando no EKS (Deployment)
  - Amazon Managed Service for Prometheus como backend de armazenamento
  - Grafana no EKS para visualização (opcional)
  - Configurar scraping de métricas dos pods do EKS
- **Benefícios**:
  - Mantém compatibilidade com configuração existente
  - Armazenamento gerenciado pela AWS (escalável)
  - Integração com CloudWatch (opcional)

#### **Amazon CloudWatch** (Complementar)
- **Uso**: Monitoramento complementar e logs
- **Serviços**:
  - **CloudWatch Logs**: Agregação de logs de todos os serviços (via Fluent Bit/Fluentd)
  - **CloudWatch Metrics**: Métricas customizadas e de sistema
  - **CloudWatch Alarms**: Alertas baseados em métricas
  - **CloudWatch Dashboards**: Visualização de métricas

---

### 7. **Segurança**

#### **AWS Secrets Manager** ⭐ ESCOLHIDO
- **Uso**: Gerenciar credenciais e secrets (senhas de DB, tokens, etc.)
- **Benefícios**:
  - Rotação automática de secrets
  - Criptografia automática
  - Integração com RDS para rotação de senhas
  - Auditoria de acesso

#### **AWS Systems Manager Parameter Store**
- **Uso**: Configurações não sensíveis
- **Benefícios**: Mais barato que Secrets Manager para dados não sensíveis

#### **AWS WAF (Web Application Firewall)** ⭐ ESCOLHIDO
- **Uso**: Proteção do API Gateway e CloudFront
- **Benefícios**:
  - Proteção contra OWASP Top 10
  - Rate limiting
  - Filtros de IP/Geo
  - Proteção contra DDoS
  - Regras customizadas

#### **AWS Shield** ⭐ ESCOLHIDO
- **Uso**: Proteção DDoS para ALB e CloudFront
- **Configuração**:
  - AWS Shield Standard: Incluído automaticamente (sem custo adicional)
  - AWS Shield Advanced: Proteção avançada (opcional, com custo)
- **Benefícios**: Proteção automática contra ataques DDoS

#### **Amazon VPC (Virtual Private Cloud)** ⭐ ESCOLHIDO
- **Uso**: Isolamento de rede
- **Configuração**:
  - VPC dedicada para produção
  - **Subnets públicas**: Para ALB, NAT Gateway, recursos que precisam de acesso à internet
  - **Subnets privadas**: Para EKS nodes, RDS, DocumentDB, ElastiCache (isolamento completo)
  - **NAT Gateway**: Para permitir que recursos em subnets privadas acessem a internet (downloads, updates)
  - **Security Groups**: Segregação de tráfego entre serviços
    - Security Group para EKS nodes
    - Security Group para RDS (apenas tráfego do EKS)
    - Security Group para DocumentDB (apenas tráfego do EKS)
    - Security Group para ElastiCache (apenas tráfego do EKS)
  - **NACLs (Network ACLs)**: Controle adicional de tráfego em nível de subnet

---

### 8. **CI/CD e DevOps**

#### **GitHub Actions / GitLab CI** ⭐ ESCOLHIDO
- **Uso**: CI/CD mantido no repositório
- **Configuração**:
  - **GitHub Actions** ou **GitLab CI**: Pipeline de CI/CD no repositório
  - **AWS SDK/CLI**: Para deploy no EKS
  - **kubectl**: Para aplicar manifests Kubernetes
  - **Docker Build**: Build de imagens Docker
  - **ECR (Elastic Container Registry)**: Registry para imagens Docker
- **Workflow Sugerido**:
  1. Build das imagens Docker
  2. Push para ECR
  3. Atualizar manifests Kubernetes
  4. Aplicar no cluster EKS via kubectl
  5. Verificar health checks
- **Benefícios**:
  - CI/CD próximo ao código
  - Controle total sobre o pipeline
  - Integração com ferramentas de desenvolvimento

---

### 9. **Cache e Performance**

#### **Amazon ElastiCache (Redis)** ⭐ ESCOLHIDO
- **Uso**: Cache do BFF e microserviços
- **Benefícios**:
  - Redução de carga nos bancos de dados
  - Melhoria de performance
  - Sessões de usuário
  - Rate limiting distribuído
- **Configuração**: Cluster mode para alta disponibilidade

#### **Amazon CloudFront** (já mencionado)
- **Uso**: Cache de conteúdo estático e APIs

---

### 10. **Armazenamento de Arquivos**

#### **Amazon S3** ⭐ ESCOLHIDO (Apenas Frontend)
- **Uso**: Apenas para armazenar arquivos estáticos do frontend (build de produção)
- **Configuração**:
  - Bucket S3 para build do React
  - Integração com CloudFront
  - Versionamento desabilitado (reduz custos)
  - Lifecycle policies não necessárias
- **Não utilizado para**:
  - ❌ Uploads de usuários
  - ❌ Armazenamento de arquivos
  - ❌ Backups

---

### 11. **Qualidade de Código**

#### **SonarQube no EKS** ⭐ ESCOLHIDO
- **Uso**: Manter SonarQube para análise de qualidade de código
- **Configuração**:
  - Executar SonarQube como Deployment no EKS
  - Usar RDS PostgreSQL para persistência (banco dedicado ou compartilhado)
  - Configurar Service e Ingress para acesso
  - Configurar PersistentVolume para dados do SonarQube
  - Health checks configurados
- **Benefícios**:
  - Mantém compatibilidade com configuração existente
  - Controle total sobre análise de código
  - Flexibilidade para regras customizadas

---

### 12. **Mensageria e Comunicação Assíncrona**

#### **Mensageria e Comunicação Assíncrona**
- **Uso**: ❌ Não será utilizado
- **Justificativa**: Arquitetura síncrona via API REST
- **Alternativa futura**: Se necessário, considerar Amazon SQS ou SNS

---

## 🏗️ Diagrama de Arquitetura Sugerido

```
┌─────────────────────────────────────────────────────────────┐
│                        Internet                              │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │   CloudFront (CDN)   │
                │   + AWS WAF          │
                │   + AWS Shield       │
                └──────────┬───────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │   API Gateway        │
                │   (BFF Endpoint)    │
                └──────────┬───────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │   Application        │
                │   Load Balancer      │
                │   (ALB)              │
                └──────────┬───────────┘
                           │
                           ▼
        ┌──────────────────┴──────────────────┐
        │                                      │
        ▼                                      ▼
┌───────────────────────────────────────────────────────────┐
│              Amazon EKS Cluster                         │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Namespace: production                              │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐        │ │
│  │  │   BFF    │  │ OAuth    │  │ Employees │  ...   │ │
│  │  │ (Pod)    │  │ (Pod)    │  │  (Pod)    │        │ │
│  │  └──────────┘  └──────────┘  └──────────┘        │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Namespace: infrastructure                         │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐        │ │
│  │  │ Keycloak│  │Prometheus│  │ SonarQube │        │ │
│  │  │ (Pod)    │  │ (Pod)    │  │  (Pod)    │        │ │
│  │  └──────────┘  └──────────┘  └──────────┘        │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  Node Groups (EC2 Instances em Subnets Privadas)        │
└───────────────────┬─────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   RDS        │ │  DocumentDB   │ │  ElastiCache │
│  PostgreSQL  │ │  (MongoDB)    │ │  (Redis)     │
│ (db.t3.micro)│ │               │ │              │
│ Single-AZ    │ │               │ │              │
└──────────────┘ └──────────────┘ └──────────────┘
        │           │           │
        └───────────┼───────────┘
                    │
        ┌───────────┴───────────┐
        │   VPC                  │
        │   ┌─────────────────┐ │
        │   │ Subnets Públicas│ │ (ALB, NAT Gateway)
        │   └─────────────────┘ │
        │   ┌─────────────────┐ │
        │   │ Subnets Privadas│ │ (EKS, RDS, DocumentDB, ElastiCache)
        │   └─────────────────┘ │
        │   ┌─────────────────┐ │
        │   │ NAT Gateway      │ │ (Acesso à internet de recursos privados)
        │   └─────────────────┘ │
        │   ┌─────────────────┐ │
        │   │ Security Groups  │ │ (Segregação de tráfego)
        │   └─────────────────┘ │
        └───────────────────────┘

Serviços de Apoio:
- Keycloak (no EKS)
- Prometheus + Amazon Managed Service for Prometheus
- SonarQube (no EKS)
- CloudWatch (Logs/Metrics)
- Secrets Manager (Secrets)
- S3 (Apenas Frontend)
- ECR (Container Registry)
```

---

## 💰 Estimativa de Custos (Aproximada - Região: us-east-1)

### Configuração de Produção (Custo Otimizado)

| Serviço | Configuração | Custo Mensal (USD) |
|---------|-------------|-------------------|
| **Amazon EKS** | Cluster + 3-5 nodes (t3.medium) | ~$150-250 |
| **RDS PostgreSQL** | db.t3.micro Single-AZ (sem backups, sem encryption) | ~$15-20 |
| **DocumentDB** | db.t3.medium Single-AZ (sem backup, sem Multi-AZ, sem auto-scaling) | ~$60-80 |
| **ElastiCache Redis** | cache.t3.micro | ~$15-20 |
| **API Gateway** | 10M requisições/mês | ~$35 |
| **CloudFront** | 100GB transfer | ~$10-15 |
| **S3** | 10GB storage (apenas frontend) | ~$0.25 |
| **CloudWatch** | Logs + Metrics | ~$50-100 |
| **ALB** | 1 Load Balancer | ~$20-25 |
| **NAT Gateway** | 1 Gateway | ~$32-45 |
| **Secrets Manager** | 20 secrets | ~$2 |
| **Amazon Managed Service for Prometheus** | 50M samples/mês | ~$20-30 |
| **ECR** | 20GB storage | ~$2 |
| **AWS WAF** | 10M requisições/mês | ~$5-10 |
| **AWS Shield** | Standard (incluído) | $0 |
| **TOTAL ESTIMADO** | | **~$420-580/mês** |

### Configuração de Desenvolvimento/Teste

| Serviço | Configuração | Custo Mensal (USD) |
|---------|-------------|-------------------|
| **Amazon EKS** | Cluster + 2 nodes (t3.small) | ~$80-120 |
| **RDS PostgreSQL** | db.t3.micro Single-AZ | ~$15-20 |
| **DocumentDB** | db.t3.small Single-AZ (sem backup, sem Multi-AZ, sem auto-scaling) | ~$30-40 |
| **ElastiCache Redis** | cache.t3.micro | ~$15-20 |
| **API Gateway** | 1M requisições/mês | ~$3.50 |
| **CloudFront** | 10GB transfer | ~$1-2 |
| **S3** | 5GB storage | ~$0.12 |
| **CloudWatch** | Logs + Metrics | ~$10-20 |
| **ALB** | 1 Load Balancer | ~$20-25 |
| **NAT Gateway** | 1 Gateway | ~$32-45 |
| **Amazon Managed Service for Prometheus** | 10M samples/mês | ~$5-10 |
| **ECR** | 10GB storage | ~$1 |
| **TOTAL ESTIMADO** | | **~$230-320/mês** |

**Nota**: Custos podem variar significativamente baseado em uso real, região, e otimizações. A configuração escolhida prioriza redução de custos com instâncias menores e recursos mínimos.

**Nota**: Custos podem variar significativamente baseado em uso real, região, e otimizações.

---

## 🚀 Plano de Migração Sugerido

### Fase 1: Preparação (Semana 1-2)
1. Criar conta AWS e configurar organização
2. Configurar VPC, subnets, security groups
3. Configurar IAM roles e policies
4. Criar repositórios ECR para imagens Docker

### Fase 2: Infraestrutura Base (Semana 3-4)
1. Provisionar RDS PostgreSQL
2. Provisionar DocumentDB
3. Configurar ElastiCache Redis
4. Configurar Secrets Manager
5. Migrar dados dos bancos locais para AWS

### Fase 3: Serviços de Apoio (Semana 5-6)
1. Configurar Amazon Cognito (ou manter Keycloak)
2. Configurar CloudWatch Logs e Metrics
3. Configurar X-Ray
4. Configurar S3 buckets

### Fase 4: Aplicação (Semana 7-10)
1. Criar cluster ECS
2. Deploy do BFF
3. Deploy dos microserviços (um por vez)
4. Configurar API Gateway
5. Configurar ALB
6. Testes de integração

### Fase 5: Frontend e CDN (Semana 11-12)
1. Build do frontend para produção
2. Upload para S3
3. Configurar CloudFront
4. Configurar domínio e certificado SSL

### Fase 6: CI/CD (Semana 13-14)
1. Configurar CodePipeline
2. Configurar CodeBuild
3. Configurar CodeDeploy
4. Testes de pipeline completo

### Fase 7: Otimização e Monitoramento (Semana 15-16)
1. Configurar auto-scaling
2. Configurar alertas CloudWatch
3. Otimização de custos
4. Documentação final

---

## ✅ Checklist de Migração

### Pré-requisitos
- [ ] Conta AWS configurada
- [ ] Budget alerts configurados
- [ ] IAM users/roles criados
- [ ] VPC e networking configurados

### Infraestrutura
- [ ] RDS PostgreSQL provisionado
- [ ] DocumentDB provisionado
- [ ] ElastiCache Redis provisionado
- [ ] S3 buckets criados
- [ ] Secrets Manager configurado

### Aplicação
- [ ] ECS Cluster criado
- [ ] Task Definitions criadas
- [ ] ECS Services criados
- [ ] API Gateway configurado
- [ ] ALB configurado
- [ ] Health checks funcionando

### Segurança
- [ ] Security Groups configurados
- [ ] NACLs configurados
- [ ] WAF configurado
- [ ] SSL/TLS certificados configurados
- [ ] Secrets rotacionados

### Monitoramento
- [ ] CloudWatch Logs configurado
- [ ] CloudWatch Metrics configurado
- [ ] X-Ray configurado
- [ ] Alertas configurados
- [ ] Dashboards criados

### CI/CD
- [ ] CodePipeline configurado
- [ ] CodeBuild configurado
- [ ] CodeDeploy configurado
- [ ] Testes automatizados

---

## 📚 Recursos Adicionais

### Documentação AWS
- [Amazon ECS Best Practices](https://docs.aws.amazon.com/AmazonECS/latest/bestpracticesguide/intro.html)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [AWS Security Best Practices](https://aws.amazon.com/security/security-resources/)

### Ferramentas
- [AWS CloudFormation](https://aws.amazon.com/cloudformation/) - IaC
- [AWS CDK](https://aws.amazon.com/cdk/) - IaC com código
- [Terraform](https://www.terraform.io/) - IaC multi-cloud
- [AWS CLI](https://aws.amazon.com/cli/) - Linha de comando

---

**Última atualização**: Janeiro 2025

