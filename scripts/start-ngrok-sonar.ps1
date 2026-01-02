# Script para iniciar túnel ngrok para SonarQube
# Uso: .\scripts\start-ngrok-sonar.ps1

Write-Host "=== Iniciando túnel ngrok para SonarQube ===" -ForegroundColor Cyan

# Verificar se ngrok está instalado
$ngrokPath = Get-Command ngrok -ErrorAction SilentlyContinue
if (-not $ngrokPath) {
    Write-Host "[ERRO] ngrok não encontrado!" -ForegroundColor Red
    Write-Host "Instale o ngrok:" -ForegroundColor Yellow
    Write-Host "  - Windows (Chocolatey): choco install ngrok" -ForegroundColor Yellow
    Write-Host "  - Download: https://ngrok.com/download" -ForegroundColor Yellow
    Write-Host "  - Configure o authtoken: ngrok config add-authtoken SEU_TOKEN" -ForegroundColor Yellow
    exit 1
}

# Verificar se SonarQube está rodando
Write-Host "[INFO] Verificando se SonarQube está rodando..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:9000/api/system/status" -Method Get -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "[SUCCESS] SonarQube está rodando!" -ForegroundColor Green
    }
} catch {
    Write-Host "[ERRO] SonarQube não está acessível em http://localhost:9000" -ForegroundColor Red
    Write-Host "Inicie o SonarQube primeiro:" -ForegroundColor Yellow
    Write-Host "  docker compose up -d sonarqube" -ForegroundColor Yellow
    exit 1
}

# Verificar se já existe um túnel ngrok ativo
Write-Host "[INFO] Verificando túneis ngrok existentes..." -ForegroundColor Cyan
try {
    $tunnels = ngrok api tunnels list 2>$null | ConvertFrom-Json
    if ($tunnels.tunnels) {
        $existingTunnel = $tunnels.tunnels | Where-Object { $_.config.addr -eq "localhost:9000" }
        if ($existingTunnel) {
            Write-Host "[INFO] Túnel ngrok já existe!" -ForegroundColor Yellow
            Write-Host "[INFO] URL pública: $($existingTunnel.public_url)" -ForegroundColor Green
            Write-Host "[INFO] Atualize o secret SONAR_HOST_URL no GitHub com esta URL" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "Pressione Ctrl+C para encerrar o túnel quando terminar" -ForegroundColor Yellow
            Write-Host "Ou execute: ngrok api tunnels delete $($existingTunnel.id)" -ForegroundColor Yellow
            exit 0
        }
    }
} catch {
    # Ignora erro se ngrok não estiver rodando
}

# Iniciar túnel ngrok
Write-Host "[INFO] Iniciando túnel ngrok na porta 9000..." -ForegroundColor Cyan
Write-Host "[INFO] Pressione Ctrl+C para encerrar o túnel" -ForegroundColor Yellow
Write-Host ""

# Iniciar ngrok em background e capturar a URL
$ngrokProcess = Start-Process -FilePath "ngrok" -ArgumentList "http", "9000" -NoNewWindow -PassThru

# Aguardar alguns segundos para ngrok inicializar
Start-Sleep -Seconds 3

# Obter a URL pública do túnel
try {
    $tunnelInfo = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -Method Get -ErrorAction Stop
    if ($tunnelInfo.tunnels) {
        $publicUrl = ($tunnelInfo.tunnels | Where-Object { $_.proto -eq "https" }).public_url
        if ($publicUrl) {
            Write-Host ""
            Write-Host "========================================" -ForegroundColor Green
            Write-Host "  TÚNEL NGROK ATIVO!" -ForegroundColor Green
            Write-Host "========================================" -ForegroundColor Green
            Write-Host ""
            Write-Host "URL pública: $publicUrl" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "PRÓXIMOS PASSOS:" -ForegroundColor Yellow
            Write-Host "1. Copie a URL acima" -ForegroundColor White
            Write-Host "2. Vá em: GitHub → Settings → Secrets → Actions" -ForegroundColor White
            Write-Host "3. Atualize ou crie o secret 'SONAR_HOST_URL' com: $publicUrl" -ForegroundColor White
            Write-Host ""
            Write-Host "Dashboard ngrok: http://localhost:4040" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "Pressione Ctrl+C para encerrar o túnel" -ForegroundColor Yellow
            Write-Host ""
        } else {
            Write-Host "[AVISO] Não foi possível obter a URL pública. Verifique: http://localhost:4040" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "[AVISO] Não foi possível obter informações do túnel automaticamente." -ForegroundColor Yellow
    Write-Host "Acesse http://localhost:4040 para ver a URL pública" -ForegroundColor Cyan
}

# Manter o script rodando
try {
    Wait-Process -Id $ngrokProcess.Id
} catch {
    Write-Host "[INFO] Túnel encerrado." -ForegroundColor Cyan
}
