# Análise SonarQube via Docker

Este script permite executar análises do SonarQube **sem precisar instalar dependências localmente**, usando apenas containers Docker.

## Pré-requisitos

- Docker e Docker Compose instalados
- SonarQube rodando: `docker compose up -d sonarqube`
- Token do SonarQube configurado no arquivo `.env`

## Uso

### Analisar um serviço específico

```powershell
.\scripts\run-sonar-analysis.ps1 -Service employees
```

### Analisar todos os serviços

```powershell
.\scripts\run-sonar-analysis.ps1 -All
```

## Serviços Disponíveis

- `employees` (Java)
- `lessons` (TypeScript/NestJS)
- `rooms` (TypeScript/NestJS)
- `reservations` (TypeScript/NestJS)
- `resources` (TypeScript/NestJS)
- `bff` (TypeScript/NestJS)
- `oauth` (Python)
- `professors` (Python)
- `courses` (Python)
- `students` (.NET)
- `classes` (.NET)

## Como Funciona

1. **Carrega variáveis** do arquivo `.env` (SONAR_TOKEN, SONAR_HOST_URL)
2. **Verifica** se o SonarQube está rodando
3. **Executa build e testes** dentro de um container Docker apropriado:
   - Java: `maven:3.9-eclipse-temurin-21-alpine`
   - TypeScript: `node:20-alpine`
   - Python: `python:3.12-alpine`
   - .NET: `mcr.microsoft.com/dotnet/sdk:8.0`
4. **Executa SonarQube Scanner** em outro container
5. **Envia resultados** para o SonarQube

## Vantagens

✅ **Sem instalação local** de JDK, Node.js, Python, .NET SDK  
✅ **Ambiente isolado** - cada análise roda em container limpo  
✅ **Consistência** - mesma versão de ferramentas sempre  
✅ **Sem conflitos** - não interfere com seu ambiente local  

## Exemplo Completo

```powershell
# 1. Iniciar SonarQube
docker compose up -d sonarqube

# 2. Aguardar SonarQube estar pronto (cerca de 1-2 minutos)
Start-Sleep -Seconds 60

# 3. Executar análise
.\scripts\run-sonar-analysis.ps1 -Service employees

# 4. Ver resultados
# Acesse: http://localhost:9000
```

## Troubleshooting

### Erro: "SONAR_TOKEN não encontrado"

Execute o script de configuração:
```powershell
.\backend\utils\sonarqube\setup-sonar.ps1
```

### Erro: "SonarQube não está disponível"

Verifique se está rodando:
```powershell
docker compose ps sonarqube
docker compose logs sonarqube
```

### Erro: "Diretório não encontrado"

Certifique-se de estar na raiz do projeto e que os submódulos estão atualizados:
```powershell
git submodule update --init --recursive
```

## Notas

- As imagens Docker são baixadas automaticamente na primeira execução
- O build e testes são executados dentro do container, não localmente
- Os relatórios de cobertura são gerados dentro do container e enviados ao SonarQube
- Cada análise é independente e não afeta outras
