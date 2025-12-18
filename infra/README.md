# Infraestrutura AWS - Closed CRAS 2025-2

Este diretório contém a documentação completa sobre a arquitetura AWS recomendada para o sistema Closed CRAS.

## 📚 Documentação Disponível

### 0. [Configuração de Perfil AWS Local](./aws-profile-setup.md)
Guia completo para configurar perfil AWS local com scripts automatizados:
- Instruções passo a passo
- Script PowerShell para Windows (`setup-aws-profile.ps1`)
- Script Bash para Linux/Mac (`setup-aws-profile.sh`)
- Configuração com MFA
- Boas práticas de segurança

### 1. [Análise Completa de Arquitetura AWS](./aws-architecture-analysis.md)
Documento detalhado com:
- Visão geral da arquitetura atual
- Recomendações detalhadas de serviços AWS
- Diagrama de arquitetura sugerido
- Estimativas de custos
- Plano de migração completo
- Checklist de implementação

**Recomendado para**: Arquitetos, DevOps, equipe técnica completa

---

### 2. [Resumo Executivo - Recomendações AWS](./aws-recommendations-summary.md)
Documento executivo com:
- Serviços AWS prioritários (essenciais, importantes, opcionais)
- Comparação: Arquitetura Atual vs AWS
- Estratégia de custos e otimizações
- Roadmap de implementação (3 fases)
- Considerações de segurança
- Métricas de sucesso

**Recomendado para**: Gestores, tomadores de decisão, stakeholders

---

### 3. [Mapeamento de Serviços: Docker Compose → AWS](./aws-service-mapping.md)
Mapeamento direto com:
- Tabela de mapeamento de cada serviço atual para AWS
- Configurações específicas por serviço
- Decisões arquiteturais principais
- Checklist de migração por serviço

**Recomendado para**: Desenvolvedores, equipe de migração

---

## 🎯 Início Rápido

### Para Gestores e Tomadores de Decisão
1. Leia o [Resumo Executivo](./aws-recommendations-summary.md)
2. Revise as estimativas de custos
3. Analise o roadmap de implementação

### Para Arquitetos e DevOps
1. Leia a [Análise Completa](./aws-architecture-analysis.md)
2. Revise o [Mapeamento de Serviços](./aws-service-mapping.md)
3. Analise o plano de migração detalhado

### Para Desenvolvedores
1. Revise o [Mapeamento de Serviços](./aws-service-mapping.md)
2. Consulte as configurações específicas por serviço
3. Siga o checklist de migração

---

## 📊 Resumo das Recomendações Principais

### ⭐ Serviços Essenciais

| Categoria | Serviço AWS | Substitui |
|-----------|-------------|-----------|
| **Computação** | Amazon EKS | Docker Compose |
| **Banco Relacional** | Amazon RDS PostgreSQL (configuração mínima) | PostgreSQL container |
| **Banco NoSQL** | Amazon DocumentDB (configuração mínima) | MongoDB container |
| **Frontend/CDN** | S3 + CloudFront | Frontend container |
| **Autenticação** | Keycloak no EKS | Keycloak container |
| **API Management** | Amazon API Gateway | - |
| **Load Balancing** | Application Load Balancer | - |
| **Rede** | Amazon VPC (subnets públicas/privadas) | Docker network |
| **NAT Gateway** | NAT Gateway | - |

### 🔧 Serviços Importantes

| Categoria | Serviço AWS | Substitui |
|-----------|-------------|-----------|
| **Cache** | Amazon ElastiCache (Redis) | Cache em memória |
| **Secrets** | AWS Secrets Manager | Variáveis de ambiente |
| **Monitoramento** | Prometheus + Amazon Managed Service for Prometheus | Prometheus container |
| **Qualidade** | SonarQube no EKS | SonarQube container |
| **CI/CD** | GitHub Actions / GitLab CI | Scripts manuais |
| **Segurança** | AWS WAF + AWS Shield | - |

---

## 💰 Estimativa de Custos

### Produção (Mensal)
- **Mínimo**: ~$420/mês
- **Máximo**: ~$580/mês
- **Média**: ~$500/mês

### Desenvolvimento/Teste (Mensal)
- **Mínimo**: ~$230/mês
- **Máximo**: ~$320/mês
- **Média**: ~$275/mês

**Nota**: Custos otimizados com configuração mínima do RDS e DocumentDB (sem Multi-AZ, backups automáticos, encryption, auto-scaling) e instâncias menores.

*Valores aproximados para região us-east-1. Custos podem variar baseado em uso real.*

---

## 🚀 Próximos Passos

1. **Revisar** a documentação completa
2. **Criar** conta AWS (se não existir)
3. **Configurar** AWS Organizations e budgets
4. **Definir** responsável pela infraestrutura
5. **Iniciar** Fase 1 do roadmap (MVP na AWS)

---

## 📞 Suporte

Para dúvidas sobre a arquitetura AWS:
- Consulte a [documentação oficial da AWS](https://docs.aws.amazon.com/)
- Revise o [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- Entre em contato com a equipe de infraestrutura

---

**Última atualização**: Janeiro 2025

