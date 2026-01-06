# Script para executar análise SonarQube usando containers Docker
# Uso: .\scripts\run-sonar-analysis.ps1 [-Service <nome-do-servico>] [-All]

param(
    [string]$Service = "",
    [switch]$All = $false
)

$ErrorActionPreference = "Stop"

# Cores para output
function Write-Info { Write-Host "[INFO] $args" -ForegroundColor Cyan }
function Write-Success { Write-Host "[SUCCESS] $args" -ForegroundColor Green }
function Write-Warning { Write-Host "[WARNING] $args" -ForegroundColor Yellow }
function Write-Error { Write-Host "[ERROR] $args" -ForegroundColor Red }

# Carregar variáveis do .env
Write-Info "Carregando variáveis de ambiente do arquivo .env..."
$envFile = ".env"
if (-not (Test-Path $envFile)) {
    Write-Error "Arquivo .env não encontrado!"
    exit 1
}

$envContent = Get-Content $envFile
foreach ($line in $envContent) {
    if ($line -match '^([^#][^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        if ($key -eq "SONAR_TOKEN" -or $key -eq "SONAR_HOST_URL" -or $key -eq "SONARQUBE_EXTERNAL_URL") {
            Set-Item -Path "env:$key" -Value $value
        }
    }
}

# Configurar variáveis padrão
if (-not $env:SONAR_HOST_URL) {
    # No Windows, usar host.docker.internal para containers acessarem localhost
    $env:SONAR_HOST_URL = "http://host.docker.internal:9000"
} else {
    # Se já está configurado, converter localhost para host.docker.internal para containers
    $env:SONAR_HOST_URL = $env:SONAR_HOST_URL -replace "localhost", "host.docker.internal"
}
if (-not $env:SONAR_TOKEN) {
    Write-Error "SONAR_TOKEN não encontrado no arquivo .env!"
    Write-Info "Execute: .\backend\utils\sonarqube\setup-sonar.ps1"
    exit 1
}

Write-Success "Variáveis carregadas!"
Write-Info "SONAR_HOST_URL: $env:SONAR_HOST_URL"

# Verificar se SonarQube está rodando (usar localhost para verificação local)
$localSonarUrl = $env:SONAR_HOST_URL -replace "host.docker.internal", "localhost"
Write-Info "Verificando se SonarQube está acessível em $localSonarUrl..."
try {
    $response = Invoke-RestMethod -Uri "$localSonarUrl/api/system/status" -Method Get -TimeoutSec 5
    if ($response.status -eq "UP") {
        Write-Success "SonarQube está rodando!"
        Write-Info "URL para containers: $env:SONAR_HOST_URL"
    } else {
        Write-Error "SonarQube não está disponível (status: $($response.status))"
        exit 1
    }
} catch {
    Write-Error "Não foi possível conectar ao SonarQube em $localSonarUrl"
    Write-Info "Verifique se o SonarQube está rodando: docker compose ps sonarqube"
    exit 1
}

# Definir serviços disponíveis
$services = @{
    "employees" = @{
        path = "backend/employees"
        language = "java"
        buildCommand = "mvn clean test jacoco:report"
        projectKey = "constrsw-employees"
    }
    "lessons" = @{
        path = "backend/lessons"
        language = "typescript"
        buildCommand = "npm ci && npm run test:cov"
        projectKey = "constrsw-lessons"
    }
    "rooms" = @{
        path = "backend/rooms"
        language = "typescript"
        buildCommand = "npm ci && npm run test:cov"
        projectKey = "constrsw-rooms"
    }
    "reservations" = @{
        path = "backend/reservations"
        language = "typescript"
        buildCommand = "npm ci && npm run test:cov"
        projectKey = "constrsw-reservations"
    }
    "resources" = @{
        path = "backend/resources"
        language = "typescript"
        buildCommand = "npm ci && npm run test:cov"
        projectKey = "constrsw-resources"
    }
    "bff" = @{
        path = "backend/bff"
        language = "typescript"
        buildCommand = "npm ci && npm run test:cov"
        projectKey = "constrsw-bff"
    }
    "oauth" = @{
        path = "backend/oauth"
        language = "python"
        buildCommand = "poetry install && poetry run task test"
        projectKey = "constrsw-oauth"
    }
    "professors" = @{
        path = "backend/professors"
        language = "python"
        buildCommand = "poetry install && poetry run pytest --cov=professors --cov-report=xml"
        projectKey = "constrsw-professors"
    }
    "courses" = @{
        path = "backend/courses"
        language = "python"
        buildCommand = "pip install -r requirements.txt && pytest --cov=src --cov-report=xml"
        projectKey = "constrsw-courses"
    }
    "students" = @{
        path = "backend/students"
        language = "dotnet"
        buildCommand = "dotnet test --collect:`"XPlat Code Coverage`""
        projectKey = "constrsw-students"
    }
    "classes" = @{
        path = "backend/classes/ClasseMicroservice"
        language = "dotnet"
        buildCommand = "dotnet test --collect:`"XPlat Code Coverage`""
        projectKey = "constrsw-classes"
    }
}

# Determinar quais serviços analisar
$servicesToAnalyze = @()
if ($All) {
    $servicesToAnalyze = $services.Keys
    Write-Info "Analisando TODOS os serviços..."
} elseif ($Service) {
    if ($services.ContainsKey($Service)) {
        $servicesToAnalyze = @($Service)
        Write-Info "Analisando serviço: $Service"
    } else {
        Write-Error "Serviço '$Service' não encontrado!"
        Write-Info "Serviços disponíveis: $($services.Keys -join ', ')"
        exit 1
    }
} else {
    Write-Error "Especifique um serviço com -Service <nome> ou use -All para todos"
    Write-Info "Serviços disponíveis: $($services.Keys -join ', ')"
    Write-Info "Exemplo: .\scripts\run-sonar-analysis.ps1 -Service employees"
    exit 1
}

# Função para executar análise de um serviço
function Invoke-SonarAnalysis {
    param($serviceName, $serviceConfig)
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  Analisando: $serviceName" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    
    $servicePath = $serviceConfig.path
    $projectKey = $serviceConfig.projectKey
    $language = $serviceConfig.language
    $buildCommand = $serviceConfig.buildCommand
    
    if (-not (Test-Path $servicePath)) {
        Write-Warning "Diretório $servicePath não encontrado. Pulando..."
        return $false
    }
    
    # Determinar imagem Docker baseada na linguagem
    $dockerImage = switch ($language) {
        "java" { "maven:3.9-eclipse-temurin-21-alpine" }
        "typescript" { "node:20-alpine" }
        "python" { "python:3.12-alpine" }
        "dotnet" { "mcr.microsoft.com/dotnet/sdk:8.0" }
        default { Write-Error "Linguagem não suportada: $language"; return $false }
    }
    
    Write-Info "Usando imagem Docker: $dockerImage"
    Write-Info "Executando build e testes no container..."
    
    # Executar build e testes no container
    $buildResult = docker run --rm `
        -v "${PWD}/${servicePath}:/workspace" `
        -w /workspace `
        $dockerImage `
        sh -c "$buildCommand"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Build/testes falharam, mas continuando com análise..."
    }
    
    Write-Info "Executando SonarQube Scanner..."
    
    # Verificar se existe sonar-project.properties
    $sonarProps = Join-Path $servicePath "sonar-project.properties"
    if (Test-Path $sonarProps) {
        Write-Info "Usando sonar-project.properties do serviço"
        # Quando existe sonar-project.properties, só passar host e token se não estiverem no arquivo
        $scannerArgs = @(
            "-Dsonar.host.url=$env:SONAR_HOST_URL",
            "-Dsonar.login=$env:SONAR_TOKEN"
        )
    } else {
        Write-Info "Usando parâmetros inline (sonar-project.properties não encontrado)"
        $scannerArgs = @(
            "-Dsonar.projectKey=$projectKey",
            "-Dsonar.host.url=$env:SONAR_HOST_URL",
            "-Dsonar.login=$env:SONAR_TOKEN"
        )
    }
    
    # Executar SonarQube Scanner
    $scannerResult = docker run --rm `
        -v "${PWD}/${servicePath}:/usr/src" `
        -w /usr/src `
        -e SONAR_HOST_URL="$env:SONAR_HOST_URL" `
        -e SONAR_TOKEN="$env:SONAR_TOKEN" `
        sonarsource/sonar-scanner-cli:latest `
        $scannerArgs
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Análise do $serviceName concluída com sucesso!"
        return $true
    } else {
        Write-Error "Análise do $serviceName falhou!"
        return $false
    }
}

# Executar análises
$successCount = 0
$failCount = 0

foreach ($serviceName in $servicesToAnalyze) {
    try {
        if (Invoke-SonarAnalysis -serviceName $serviceName -serviceConfig $services[$serviceName]) {
            $successCount++
        } else {
            $failCount++
        }
    } catch {
        Write-Error "Erro ao analisar $serviceName : $($_.Exception.Message)"
        $failCount++
    }
}

# Resumo
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RESUMO DA ANÁLISE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Success "Sucessos: $successCount"
if ($failCount -gt 0) {
    Write-Error "Falhas: $failCount"
}
Write-Host ""
Write-Info "Acesse o SonarQube para ver os resultados: $env:SONAR_HOST_URL"
