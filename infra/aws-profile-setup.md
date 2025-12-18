# Configuração de Perfil AWS Local

Este guia explica como configurar um perfil AWS local para desenvolvimento e deploy da aplicação Closed CRAS.

## 📋 Pré-requisitos

1. **AWS CLI instalado**
   - Windows: [Instalador AWS CLI](https://awscli.amazonaws.com/AWSCLIV2.msi)
   - Linux/Mac: `curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"`
   - Ou via package manager: `pip install awscli`

2. **Credenciais AWS**
   - Access Key ID
   - Secret Access Key
   - Região preferida (ex: `us-east-1`)

## 🚀 Configuração Rápida

### Método 1: Configuração Interativa (Recomendado)

```bash
# Configurar credenciais e região
aws configure

# Ou configurar um perfil específico
aws configure --profile constrsw2025-2
```

**Durante a configuração, você será solicitado:**
- AWS Access Key ID: `[sua-access-key]`
- AWS Secret Access Key: `[sua-secret-key]`
- Default region name: `us-east-1` (ou sua região preferida)
- Default output format: `json` (recomendado)

### Método 2: Configuração Manual

#### 1. Criar arquivo de credenciais

**Windows:**
```powershell
# Criar diretório se não existir
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.aws"

# Criar arquivo de credenciais
@"
[default]
aws_access_key_id = YOUR_ACCESS_KEY_ID
aws_secret_access_key = YOUR_SECRET_ACCESS_KEY

[constrsw2025-2]
aws_access_key_id = YOUR_ACCESS_KEY_ID
aws_secret_access_key = YOUR_SECRET_ACCESS_KEY
"@ | Out-File -FilePath "$env:USERPROFILE\.aws\credentials" -Encoding utf8
```

**Linux/Mac:**
```bash
# Criar diretório se não existir
mkdir -p ~/.aws

# Criar arquivo de credenciais
cat > ~/.aws/credentials << EOF
[default]
aws_access_key_id = YOUR_ACCESS_KEY_ID
aws_secret_access_key = YOUR_SECRET_ACCESS_KEY

[constrsw2025-2]
aws_access_key_id = YOUR_ACCESS_KEY_ID
aws_secret_access_key = YOUR_SECRET_ACCESS_KEY
EOF
```

#### 2. Criar arquivo de configuração

**Windows:**
```powershell
@"
[default]
region = us-east-1
output = json

[profile constrsw2025-2]
region = us-east-1
output = json
"@ | Out-File -FilePath "$env:USERPROFILE\.aws\config" -Encoding utf8
```

**Linux/Mac:**
```bash
cat > ~/.aws/config << EOF
[default]
region = us-east-1
output = json

[profile constrsw2025-2]
region = us-east-1
output = json
EOF
```

## 🔐 Configuração com MFA (Multi-Factor Authentication)

Se sua conta AWS requer MFA, você precisará configurar um perfil com role assumida:

```ini
# ~/.aws/config
[profile constrsw2025-2]
region = us-east-1
output = json
role_arn = arn:aws:iam::ACCOUNT_ID:role/RoleName
source_profile = default
mfa_serial = arn:aws:iam::ACCOUNT_ID:mfa/USERNAME
```

## ✅ Verificar Configuração

```bash
# Verificar perfil padrão
aws sts get-caller-identity

# Verificar perfil específico
aws sts get-caller-identity --profile constrsw2025-2

# Listar todos os perfis configurados
aws configure list-profiles
```

## 📝 Usar o Perfil

### Em comandos AWS CLI

```bash
# Usar perfil específico
aws s3 ls --profile constrsw2025-2

# Usar variável de ambiente
export AWS_PROFILE=constrsw2025-2
aws s3 ls
```

### Em scripts e ferramentas

**Terraform:**
```hcl
provider "aws" {
  region  = "us-east-1"
  profile = "constrsw2025-2"
}
```

**kubectl (EKS):**
```bash
# Configurar kubeconfig com perfil
aws eks update-kubeconfig --name constrsw-cluster --region us-east-1 --profile constrsw2025-2
```

**Docker/ECR:**
```bash
# Login no ECR com perfil
aws ecr get-login-password --region us-east-1 --profile constrsw2025-2 | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
```

**GitHub Actions:**
```yaml
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v2
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: us-east-1
```

## 🔒 Segurança

### Boas Práticas

1. **Nunca commitar credenciais**
   - Adicione `~/.aws/` ao `.gitignore`
   - Use variáveis de ambiente ou AWS Secrets Manager

2. **Usar IAM Roles quando possível**
   - Em EC2/ECS/EKS, use IAM Roles ao invés de credenciais

3. **Rotacionar credenciais regularmente**
   - Acesse o IAM Console para gerar novas keys

4. **Usar permissões mínimas**
   - Aplique o princípio do menor privilégio
   - Crie políticas IAM específicas para cada perfil

### Exemplo de Política IAM Mínima

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:*",
        "eks:*",
        "rds:*",
        "docdb:*",
        "elasticache:*",
        "s3:*",
        "cloudfront:*",
        "apigateway:*",
        "elasticloadbalancing:*",
        "secretsmanager:*",
        "cloudwatch:*",
        "logs:*"
      ],
      "Resource": "*"
    }
  ]
}
```

## 🛠️ Troubleshooting

### Erro: "Unable to locate credentials"

```bash
# Verificar se o arquivo existe
ls ~/.aws/credentials  # Linux/Mac
dir $env:USERPROFILE\.aws\credentials  # Windows

# Verificar permissões (Linux/Mac)
chmod 600 ~/.aws/credentials
chmod 600 ~/.aws/config
```

### Erro: "The security token included in the request is invalid"

- Verifique se as credenciais estão corretas
- Verifique se as credenciais não expiraram
- Se usar MFA, gere um novo token de sessão

### Erro: "Access Denied"

- Verifique as permissões IAM do usuário
- Verifique se está usando a região correta
- Verifique se o recurso existe na conta/região

## 📚 Recursos Adicionais

- [Documentação AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/)
- [Configuração de Perfis AWS](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html)
- [Melhores Práticas de Segurança AWS](https://aws.amazon.com/security/security-resources/)

---

**Última atualização**: Janeiro 2025

