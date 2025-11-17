# Script para executar testes dentro de container Docker
# Uso: .\run-tests.ps1

$ErrorActionPreference = "Continue"

Write-Host "🚀 Iniciando execução dos testes no container Docker..." -ForegroundColor Cyan
Write-Host ""

$employeesPath = Join-Path $PSScriptRoot "."
$absolutePath = (Resolve-Path $employeesPath).Path

Write-Host "📁 Diretório: $absolutePath" -ForegroundColor Gray
Write-Host ""

docker run --rm `
  -v /var/run/docker.sock:/var/run/docker.sock `
  -e TESTCONTAINERS_RYUK_DISABLED=true `
  -v "${absolutePath}:/app" `
  -w /app `
  maven:3.9-eclipse-temurin-21-alpine `
  mvn test

$exitCode = $LASTEXITCODE

Write-Host ""
if ($exitCode -eq 0) {
    Write-Host "✅ Testes executados com sucesso!" -ForegroundColor Green
} else {
    Write-Host "❌ Testes falharam com código de saída: $exitCode" -ForegroundColor Red
}

exit $exitCode

