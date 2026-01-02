# Script para configurar SonarQube automaticamente
# Cria usuário, torna admin e gera token
# Localização: backend/utils/sonarqube/setup-sonar.ps1

param(
    [string]$SonarUrl = "http://localhost:9000",
    [string]$AdminUser = "admin",
    # Senha padrão do usuário admin em uma instalação nova é "admin".
    # Se você já alterou a senha via UI, chame o script com: -AdminPassword "minhaSenha"
    [string]$AdminPassword = "admin",
    [string]$NewUser = "constrsw",
    [string]$NewPassword = "a12345678",
    [string]$NewEmail = "constrsw@example.com",
    [string]$TokenName = "constrsw-token"
)

# Funções de log
function Write-Info { Write-Host "[INFO] $args" -ForegroundColor Cyan }
function Write-Success { Write-Host "[SUCCESS] $args" -ForegroundColor Green }
function Write-Warning { Write-Host "[WARNING] $args" -ForegroundColor Yellow }
function Write-Error { Write-Host "[ERROR] $args" -ForegroundColor Red }

# Função para aguardar SonarQube estar pronto
function Wait-ForSonarQube {
    Write-Info "Aguardando SonarQube estar disponível..."
    $maxAttempts = 30
    $attempt = 0
    
    while ($attempt -lt $maxAttempts) {
        try {
            $response = Invoke-RestMethod -Uri "$SonarUrl/api/system/status" -Method Get -TimeoutSec 5
            if ($response.status -eq "UP") {
                Write-Success "SonarQube está pronto!"
                return $true
            }
        } catch {
            # Ignora erro e continua tentando
        }
        
        $attempt++
        Write-Info "Tentativa $attempt/$maxAttempts - Aguardando 10 segundos..."
        Start-Sleep -Seconds 10
    }
    
    Write-Error "SonarQube não ficou disponível em $maxAttempts tentativas"
    return $false
}

# Função para criar usuário
function New-SonarUser {
    param($user, $password, $email, $name, $adminUser, $adminPassword)
    
    Write-Info "Criando usuário '$user'..."
    
    $body = @{
        login = $user
        name = $name
        password = $password
        email = $email
    }
    
    try {
        $credential = New-Object System.Management.Automation.PSCredential($adminUser, (ConvertTo-SecureString $adminPassword -AsPlainText -Force))
        # Em PowerShell 7+, é necessário permitir envio de credenciais em HTTP (ambiente local)
        $response = Invoke-RestMethod -Uri "$SonarUrl/api/users/create" -Method Post -Body $body -ContentType "application/x-www-form-urlencoded" -Credential $credential -AllowUnencryptedAuthentication
        Write-Success "Usuário '$user' criado com sucesso!"
        return $true
    } catch {
        if ($_.Exception.Response.StatusCode -eq 400) {
            Write-Warning "Usuário '$user' já existe"
            return $true
        } else {
            Write-Error "Erro ao criar usuário: $($_.Exception.Message)"
            return $false
        }
    }
}

# Função para tornar usuário administrador
function Set-SonarUserAdmin {
    param($user)
    
    Write-Info "Tornando usuário '$user' administrador..."
    
    try {
        $response = Invoke-RestMethod -Uri "$SonarUrl/api/users/deactivate" -Method Post -Body "login=$user" -ContentType "application/x-www-form-urlencoded"
        Write-Success "Usuário '$user' tornado administrador!"
        return $true
    } catch {
        Write-Error "Erro ao tornar usuário administrador: $($_.Exception.Message)"
        return $false
    }
}

# Função para gerar token
function New-SonarToken {
    param($user, $password, $tokenName)
    
    Write-Info "Gerando token '$tokenName' para usuário '$user'..."
    
    try {
        $credential = New-Object System.Management.Automation.PSCredential($user, (ConvertTo-SecureString $password -AsPlainText -Force))
        # Em PowerShell 7+, é necessário permitir envio de credenciais em HTTP (ambiente local)
        $response = Invoke-RestMethod -Uri "$SonarUrl/api/user_tokens/generate" -Method Post -Body "name=$tokenName" -ContentType "application/x-www-form-urlencoded" -Credential $credential -AllowUnencryptedAuthentication
        Write-Success "Token gerado com sucesso!"
        return $response.token
    } catch {
        Write-Error "Erro ao gerar token: $($_.Exception.Message)"
        return $null
    }
}

# Função para salvar variáveis de ambiente
function Save-EnvironmentVariables {
    param($sonarUrl, $sonarUser, $sonarPassword, $sonarToken)
    
    Write-Info "Salvando variáveis de ambiente no arquivo .env da raiz do projeto..."
    
    # Caminho para o arquivo .env na raiz do projeto (a partir de backend/utils/sonarqube/)
    $envFile = "../../../.env"
    
    # Verificar se o arquivo existe
    if (-not (Test-Path $envFile)) {
        Write-Error "Arquivo .env não encontrado em $envFile"
        return $false
    }
    
    # Ler o conteúdo atual
    $currentContent = Get-Content $envFile -Raw
    
    # Verificar se as variáveis do SonarQube já existem
    if ($currentContent -match "SONARQUBE_") {
        Write-Warning "Variáveis do SonarQube já existem no arquivo .env"
        Write-Info "Atualizando valores existentes..."
        
        # Substituir valores existentes
        $currentContent = $currentContent -replace "SONARQUBE_URL=.*", "SONARQUBE_URL=$sonarUrl"
        $currentContent = $currentContent -replace "SONARQUBE_USER=.*", "SONARQUBE_USER=$sonarUser"
        $currentContent = $currentContent -replace "SONARQUBE_PASSWORD=.*", "SONARQUBE_PASSWORD=$sonarPassword"
        $currentContent = $currentContent -replace "SONAR_TOKEN=.*", "SONAR_TOKEN=$sonarToken"
    } else {
        Write-Info "Adicionando configurações do SonarQube..."
        
        # Adicionar configurações do SonarQube no final do arquivo
        $sonarConfig = @"

# SonarQube
SONARQUBE_URL=$sonarUrl
SONARQUBE_USER=$sonarUser
SONARQUBE_PASSWORD=$sonarPassword
SONAR_TOKEN=$sonarToken
"@
        $currentContent = $currentContent + $sonarConfig
    }
    
    # Salvar o arquivo atualizado
    $currentContent | Out-File -FilePath $envFile -Encoding UTF8
    Write-Success "Variáveis do SonarQube salvas em '$envFile'"
    
    return $true
}

# Função principal
function Main {
    Write-Info "Iniciando configuração do SonarQube..."
    
    # Aguardar SonarQube estar pronto
    if (-not (Wait-ForSonarQube)) {
        exit 1
    }
    
    # Criar usuário
    if (-not (New-SonarUser -user $NewUser -password $NewPassword -email $NewEmail -name "ConstrSW User" -adminUser $AdminUser -adminPassword $AdminPassword)) {
        exit 1
    }
    
    # Tornar administrador (opcional - pode ser feito manualmente)
    # Set-SonarUserAdmin -user $NewUser
    
    # Gerar token
    $token = New-SonarToken -user $NewUser -password $NewPassword -tokenName $TokenName
    if (-not $token) {
        exit 1
    }
    
    # Salvar variáveis de ambiente
    Save-EnvironmentVariables -sonarUrl $SonarUrl -sonarUser $NewUser -sonarPassword $NewPassword -sonarToken $token
    
    Write-Success "Configuração do SonarQube concluída!"
    Write-Info "URL: $SonarUrl"
    Write-Info "Usuário: $NewUser"
    Write-Info "Token: $token"
    Write-Info "Arquivo .env atualizado com as variáveis de ambiente"
}

# Executar função principal
Main 