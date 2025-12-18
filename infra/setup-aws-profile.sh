#!/bin/bash
# Script Bash para configurar perfil AWS local
# Uso: ./setup-aws-profile.sh

echo "========================================"
echo "Configuração de Perfil AWS - Closed CRAS"
echo "========================================"
echo ""

# Verificar se AWS CLI está instalado
echo "Verificando AWS CLI..."
if command -v aws &> /dev/null; then
    AWS_VERSION=$(aws --version)
    echo "✓ AWS CLI encontrado: $AWS_VERSION"
else
    echo "✗ AWS CLI não encontrado!"
    echo "Por favor, instale o AWS CLI:"
    echo "  curl 'https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip' -o 'awscliv2.zip'"
    echo "  unzip awscliv2.zip"
    echo "  sudo ./aws/install"
    exit 1
fi

echo ""

# Criar diretório .aws se não existir
AWS_DIR="$HOME/.aws"
if [ ! -d "$AWS_DIR" ]; then
    echo "Criando diretório .aws..."
    mkdir -p "$AWS_DIR"
    echo "✓ Diretório criado: $AWS_DIR"
fi

# Solicitar informações do usuário
echo ""
echo "Por favor, forneça as seguintes informações:"
echo ""

read -p "Nome do perfil (padrão: constrsw2025-2): " PROFILE_NAME
PROFILE_NAME=${PROFILE_NAME:-constrsw2025-2}

read -p "AWS Access Key ID: " ACCESS_KEY_ID
if [ -z "$ACCESS_KEY_ID" ]; then
    echo "✗ Access Key ID é obrigatório!"
    exit 1
fi

read -sp "AWS Secret Access Key: " SECRET_ACCESS_KEY
echo ""

read -p "Região AWS (padrão: us-east-1): " REGION
REGION=${REGION:-us-east-1}

read -p "Formato de saída (padrão: json): " OUTPUT_FORMAT
OUTPUT_FORMAT=${OUTPUT_FORMAT:-json}

echo ""
echo "Configurando perfil '$PROFILE_NAME'..."

# Configurar usando AWS CLI
aws configure set aws_access_key_id "$ACCESS_KEY_ID" --profile "$PROFILE_NAME"
aws configure set aws_secret_access_key "$SECRET_ACCESS_KEY" --profile "$PROFILE_NAME"
aws configure set region "$REGION" --profile "$PROFILE_NAME"
aws configure set output "$OUTPUT_FORMAT" --profile "$PROFILE_NAME"

echo "✓ Perfil configurado com sucesso!"
echo ""

# Configurar permissões dos arquivos
chmod 600 "$AWS_DIR/credentials" 2>/dev/null
chmod 600 "$AWS_DIR/config" 2>/dev/null

# Verificar configuração
echo "Verificando configuração..."
if aws sts get-caller-identity --profile "$PROFILE_NAME" > /dev/null 2>&1; then
    echo "✓ Credenciais válidas!"
    echo ""
    echo "Informações da conta:"
    aws sts get-caller-identity --profile "$PROFILE_NAME"
else
    echo "✗ Erro ao verificar credenciais!"
    exit 1
fi

echo ""
echo "========================================"
echo "Configuração concluída!"
echo ""
echo "Para usar o perfil, execute:"
echo "  export AWS_PROFILE=$PROFILE_NAME"
echo "  aws s3 ls"
echo ""
echo "Ou use o parâmetro --profile:"
echo "  aws s3 ls --profile $PROFILE_NAME"
echo "========================================"

