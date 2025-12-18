# Manifests Kubernetes

Este diretório contém os manifests Kubernetes para deploy no Amazon EKS.

## 📋 Estrutura Recomendada

```
infra/k8s/
├── namespace.yaml              # Namespace para produção
├── configmaps/                # ConfigMaps compartilhados
├── secrets/                   # Secrets (referências ao AWS Secrets Manager)
├── bff/                       # Manifests do BFF
│   ├── deployment.yaml
│   ├── service.yaml
│   └── ingress.yaml
├── oauth/                     # Manifests do OAuth
│   ├── deployment.yaml
│   └── service.yaml
├── employees/                 # Manifests do Employees
│   ├── deployment.yaml
│   └── service.yaml
├── classes/                   # Manifests do Classes
│   ├── deployment.yaml
│   └── service.yaml
├── courses/                   # Manifests do Courses
│   ├── deployment.yaml
│   └── service.yaml
├── lessons/                   # Manifests do Lessons
│   ├── deployment.yaml
│   └── service.yaml
├── professors/                # Manifests do Professors
│   ├── deployment.yaml
│   └── service.yaml
├── reservations/              # Manifests do Reservations
│   ├── deployment.yaml
│   └── service.yaml
├── resources/                # Manifests do Resources
│   ├── deployment.yaml
│   └── service.yaml
├── rooms/                     # Manifests do Rooms
│   ├── deployment.yaml
│   └── service.yaml
├── students/                  # Manifests do Students
│   ├── deployment.yaml
│   └── service.yaml
├── keycloak/                  # Manifests do Keycloak
│   ├── deployment.yaml
│   ├── service.yaml
│   └── ingress.yaml
├── prometheus/                # Manifests do Prometheus
│   ├── deployment.yaml
│   └── service.yaml
└── sonarqube/                 # Manifests do SonarQube
    ├── deployment.yaml
    ├── service.yaml
    └── ingress.yaml
```

## 🚀 Próximos Passos

1. **Criar os manifests** para cada serviço
2. **Configurar variáveis de ambiente** via ConfigMaps e Secrets
3. **Configurar Ingress** para exposição externa
4. **Configurar HPA** (Horizontal Pod Autoscaler) para auto-scaling
5. **Configurar Network Policies** para segurança

## 📝 Exemplo de Deployment

Veja exemplos de manifests em:
- `infra/k8s/examples/` (será criado)

## 🔐 Secrets

Os secrets devem ser criados usando AWS Secrets Manager e referenciados nos deployments via:

```yaml
env:
  - name: DATABASE_PASSWORD
    valueFrom:
      secretKeyRef:
        name: aws-secrets-manager
        key: database-password
```

Ou usando o External Secrets Operator para integração automática.

---

**Nota**: Os manifests serão criados conforme necessário durante a implementação.

