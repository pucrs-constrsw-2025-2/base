# GitHub Actions Workflows

Este diretório contém os workflows de CI/CD para o projeto Closed CRAS.

## 📋 Workflows Disponíveis

### 1. **ci-cd.yml** - Pipeline Principal
Pipeline completa de build e deploy:
- **Build**: Constrói imagens Docker para todos os microserviços
- **Push**: Faz push das imagens para Amazon ECR
- **Deploy**: Faz deploy no Amazon EKS
- **Triggers**: Push para `main` ou `develop`

### 2. **frontend-deploy.yml** - Deploy do Frontend
Deploy do frontend React:
- **Build**: Build do React com Vite
- **Deploy**: Upload para S3
- **Cache Invalidation**: Invalida cache do CloudFront
- **Triggers**: Push para `main` ou `develop` (apenas mudanças no frontend)

### 3. **tests.yml** - Testes Automatizados
Executa testes de todos os serviços:
- **Frontend**: Testes React
- **Node.js**: Testes dos serviços NestJS
- **Python**: Testes dos serviços FastAPI
- **Java**: Testes do serviço Spring Boot
- **.NET**: Testes dos serviços C#
- **Triggers**: Push e Pull Requests

### 4. **security-scan.yml** - Scan de Segurança
Análise de segurança:
- **Docker**: Scan de vulnerabilidades nas imagens
- **Dependencies**: Scan de dependências com Snyk
- **Triggers**: Push, Pull Requests e agendado (semanal)

## 🔐 Secrets Necessários

Configure os seguintes secrets no GitHub:

### AWS
- `AWS_ACCESS_KEY_ID`: Access Key ID da AWS
- `AWS_SECRET_ACCESS_KEY`: Secret Access Key da AWS
- `AWS_ACCOUNT_ID`: ID da conta AWS

### Frontend
- `VITE_API_URL`: URL da API
- `VITE_KEYCLOAK_URL`: URL do Keycloak
- `VITE_KEYCLOAK_REALM`: Realm do Keycloak
- `VITE_KEYCLOAK_CLIENT_ID`: Client ID do Keycloak
- `CLOUDFRONT_DISTRIBUTION_ID`: ID da distribuição CloudFront

### Segurança (Opcional)
- `SNYK_TOKEN`: Token do Snyk para scan de dependências

## 🚀 Como Configurar

### 1. Configurar Secrets no GitHub

1. Vá para **Settings** > **Secrets and variables** > **Actions**
2. Clique em **New repository secret**
3. Adicione cada secret listado acima

### 2. Configurar ECR

Certifique-se de que os repositórios ECR existem:

```bash
# Criar repositórios ECR para cada serviço
aws ecr create-repository --repository-name constrsw/bff --region us-east-1
aws ecr create-repository --repository-name constrsw/oauth --region us-east-1
# ... (repetir para todos os serviços)
```

### 3. Configurar EKS

Certifique-se de que:
- O cluster EKS está criado
- O kubeconfig está configurado
- Os manifests Kubernetes estão em `infra/k8s/`

### 4. Configurar S3 e CloudFront

Certifique-se de que:
- O bucket S3 `constrsw-frontend` existe
- A distribuição CloudFront está configurada
- As políticas de acesso estão corretas

## 📝 Estrutura de Manifests Kubernetes

Crie os manifests em `infra/k8s/`:

```
infra/k8s/
├── namespace.yaml
├── bff/
│   ├── deployment.yaml
│   ├── service.yaml
│   └── ingress.yaml
├── oauth/
│   ├── deployment.yaml
│   └── service.yaml
└── ... (para cada serviço)
```

## 🔧 Customização

### Modificar Triggers

Edite o arquivo `.github/workflows/*.yml` e modifique a seção `on:`:

```yaml
on:
  push:
    branches:
      - main
      - develop
      - feature/*  # Adicionar branches customizadas
```

### Adicionar Novos Serviços

1. Adicione o serviço na matriz do workflow `ci-cd.yml`
2. Crie os manifests Kubernetes em `infra/k8s/`
3. Crie o repositório ECR correspondente

### Modificar Ambiente de Deploy

Edite a variável `EKS_NAMESPACE` no workflow:

```yaml
env:
  EKS_NAMESPACE: staging  # ou production, development
```

## 📊 Monitoramento

Os workflows geram logs e status que podem ser visualizados em:
- **Actions** tab no GitHub
- **Workflow runs** para histórico
- **Security** tab para resultados de scan

## 🐛 Troubleshooting

### Erro: "Unable to locate credentials"
- Verifique se os secrets AWS estão configurados
- Verifique se as credenciais estão corretas

### Erro: "Repository does not exist"
- Crie o repositório ECR correspondente
- Verifique o nome do repositório no workflow

### Erro: "Cluster not found"
- Verifique se o cluster EKS existe
- Verifique se o nome do cluster está correto
- Verifique as permissões IAM

### Erro: "Deployment failed"
- Verifique os logs do Kubernetes
- Verifique se os manifests estão corretos
- Verifique se as imagens foram criadas corretamente

## 📚 Recursos Adicionais

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [AWS ECR Documentation](https://docs.aws.amazon.com/ecr/)
- [AWS EKS Documentation](https://docs.aws.amazon.com/eks/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)

---

**Última atualização**: Janeiro 2025

