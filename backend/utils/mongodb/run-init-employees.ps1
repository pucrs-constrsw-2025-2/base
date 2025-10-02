# Script PowerShell para executar a população da collection de funcionários
# Este script deve ser executado após o MongoDB estar rodando

Write-Host "Aguardando MongoDB estar disponível..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "Executando script de população de funcionários..." -ForegroundColor Green

# Definir variáveis de ambiente se não estiverem definidas
$MONGODB_HOST = if ($env:MONGODB_HOST) { $env:MONGODB_HOST } else { "localhost" }
$MONGODB_PORT = if ($env:MONGODB_PORT) { $env:MONGODB_PORT } else { "27017" }
$MONGODB_USERNAME = if ($env:MONGODB_USERNAME) { $env:MONGODB_USERNAME } else { "admin" }
$MONGODB_PASSWORD = if ($env:MONGODB_PASSWORD) { $env:MONGODB_PASSWORD } else { "a12345678" }

# Executar o script de inicialização dos funcionários
try {
    mongosh --host $MONGODB_HOST --port $MONGODB_PORT `
            --username $MONGODB_USERNAME `
            --password $MONGODB_PASSWORD `
            --authenticationDatabase admin `
            --file "init-employees.js"
    
    Write-Host "Script de população de funcionários executado com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "Erro ao executar script de população: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

