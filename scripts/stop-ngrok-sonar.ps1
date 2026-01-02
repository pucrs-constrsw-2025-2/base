# Script para parar túnel ngrok do SonarQube
# Uso: .\scripts\stop-ngrok-sonar.ps1

Write-Host "=== Encerrando túnel ngrok do SonarQube ===" -ForegroundColor Cyan

try {
    # Listar túneis ativos
    $tunnels = ngrok api tunnels list 2>$null | ConvertFrom-Json
    
    if ($tunnels.tunnels) {
        $sonarTunnel = $tunnels.tunnels | Where-Object { $_.config.addr -eq "localhost:9000" }
        
        if ($sonarTunnel) {
            Write-Host "[INFO] Encerrando túnel: $($sonarTunnel.public_url)" -ForegroundColor Cyan
            ngrok api tunnels delete $sonarTunnel.id
            Write-Host "[SUCCESS] Túnel encerrado com sucesso!" -ForegroundColor Green
        } else {
            Write-Host "[INFO] Nenhum túnel ngrok ativo para a porta 9000" -ForegroundColor Yellow
        }
    } else {
        Write-Host "[INFO] Nenhum túnel ngrok ativo" -ForegroundColor Yellow
    }
} catch {
    Write-Host "[ERRO] Erro ao encerrar túnel: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "[INFO] Tente encerrar manualmente via: http://localhost:4040" -ForegroundColor Yellow
}
