# Script PowerShell para configurar perfil AWS local
# Uso: .\setup-aws-profile.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Configuração de Perfil AWS - Closed CRAS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se AWS CLI está instalado
Write-Host "Verificando AWS CLI..." -ForegroundColor Yellow
try {
    $awsVersion = aws --version 2>&1
    Write-Host "✓ AWS CLI encontrado: $awsVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ AWS CLI não encontrado!" -ForegroundColor Red
    Write-Host "Por favor, instale o AWS CLI: https://awscli.amazonaws.com/AWSCLIV2.msi" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Criar diretório .aws se não existir
$awsDir = "$env:USERPROFILE\.aws"
if (-not (Test-Path $awsDir)) {
    Write-Host "Criando diretório .aws..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $awsDir | Out-Null
    Write-Host "✓ Diretório criado: $awsDir" -ForegroundColor Green
}

# Solicitar informações do usuário
Write-Host ""
Write-Host "Por favor, forneça as seguintes informações:" -ForegroundColor Cyan
Write-Host ""

$profileName = Read-Host "Nome do perfil (padrão: constrsw2025-2)"
if ([string]::IsNullOrWhiteSpace($profileName)) {
    $profileName = "constrsw2025-2"
}

$accessKeyId = Read-Host "AWS Access Key ID"
if ([string]::IsNullOrWhiteSpace($accessKeyId)) {
    Write-Host "✗ Access Key ID é obrigatório!" -ForegroundColor Red
    exit 1
}

$secretAccessKey = Read-Host "AWS Secret Access Key" -AsSecureString
$secretAccessKeyPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secretAccessKey)
)

$region = Read-Host "Região AWS (padrão: us-east-1)"
if ([string]::IsNullOrWhiteSpace($region)) {
    $region = "us-east-1"
}

$outputFormat = Read-Host "Formato de saída (padrão: json)"
if ([string]::IsNullOrWhiteSpace($outputFormat)) {
    $outputFormat = "json"
}

Write-Host ""
Write-Host "Configurando perfil '$profileName'..." -ForegroundColor Yellow

# Configurar usando AWS CLI
aws configure set aws_access_key_id $accessKeyId --profile $profileName
aws configure set aws_secret_access_key $secretAccessKeyPlain --profile $profileName
aws configure set region $region --profile $profileName
aws configure set output $outputFormat --profile $profileName

Write-Host "✓ Perfil configurado com sucesso!" -ForegroundColor Green
Write-Host ""

# Verificar configuração
Write-Host "Verificando configuração..." -ForegroundColor Yellow
try {
    $identity = aws sts get-caller-identity --profile $profileName 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Credenciais válidas!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Informações da conta:" -ForegroundColor Cyan
        Write-Host $identity
    } else {
        Write-Host "✗ Erro ao verificar credenciais!" -ForegroundColor Red
        Write-Host $identity
    }
} catch {
    Write-Host "✗ Erro ao verificar credenciais: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Configuração concluída!" -ForegroundColor Green
Write-Host ""
Write-Host "Para usar o perfil, execute:" -ForegroundColor Yellow
Write-Host "  `$env:AWS_PROFILE='$profileName'" -ForegroundColor White
Write-Host "  aws s3 ls" -ForegroundColor White
Write-Host ""
Write-Host "Ou use o parâmetro --profile:" -ForegroundColor Yellow
Write-Host "  aws s3 ls --profile $profileName" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan

