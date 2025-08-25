# SonarQube - Análise de Qualidade de Código

## Visão Geral

O SonarQube é uma plataforma de análise estática de código que ajuda a manter a qualidade do código através da identificação de bugs, vulnerabilidades, code smells e cobertura de testes.

## Configuração

### Pré-requisitos

1. Docker e Docker Compose instalados
2. PostgreSQL rodando (já configurado no projeto)
3. Volumes externos criados

### Setup Inicial

Execute o script de configuração:

```powershell
.\setup-sonarqube.ps1
```

Ou manualmente:

```bash
# Criar volumes
docker volume create constrsw-sonarqube-data
docker volume create constrsw-sonarqube-extensions
docker volume create constrsw-sonarqube-logs

# Criar banco de dados sonar
docker-compose exec postgresql psql -U postgres -c "CREATE DATABASE sonar;"
```

### Iniciar o SonarQube

```bash
docker-compose up -d sonarqube
```

## Acesso

- **URL**: http://localhost:9000
- **Credenciais padrão**: admin/admin
- **Primeiro acesso**: Será solicitado para alterar a senha

## Configuração do Banco de Dados

O SonarQube está configurado para usar o PostgreSQL:

- **Host**: postgresql (container interno)
- **Porta**: 5432
- **Database**: sonar
- **Usuário**: postgres
- **Senha**: definida no .env

## Análise de Projetos

### Para projetos Java/Spring Boot

1. Instale o SonarQube Scanner:
```bash
# Windows
# Baixe de: https://docs.sonarqube.org/latest/analysis/scan/sonarscanner/

# Linux/Mac
wget https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-4.8.0.2856-linux.zip
unzip sonar-scanner-cli-4.8.0.2856-linux.zip
```

2. Configure o sonar-project.properties no projeto:
```properties
sonar.projectKey=constrsw-classes
sonar.projectName=ConstrSW Classes Service
sonar.projectVersion=1.0
sonar.sources=src/main/java
sonar.tests=src/test/java
sonar.java.binaries=target/classes
sonar.java.test.binaries=target/test-classes
sonar.host.url=http://localhost:9000
sonar.login=seu-token-aqui
```

3. Execute a análise:
```bash
sonar-scanner
```

### Para projetos Node.js

1. Instale o SonarQube Scanner para Node.js:
```bash
npm install -g sonarqube-scanner
```

2. Configure o sonar-project.js:
```javascript
const sonarqubeScanner = require('sonarqube-scanner');

sonarqubeScanner({
  serverUrl: 'http://localhost:9000',
  token: 'seu-token-aqui',
  options: {
    'sonar.projectKey': 'constrsw-oauth',
    'sonar.projectName': 'ConstrSW OAuth Service',
    'sonar.projectVersion': '1.0',
    'sonar.sources': 'src',
    'sonar.tests': 'test',
    'sonar.javascript.lcov.reportPaths': 'coverage/lcov.info',
    'sonar.testExecutionReportPaths': 'test-report.xml'
  }
});
```

3. Execute a análise:
```bash
node sonar-project.js
```

### Para projetos Python

1. Instale o SonarQube Scanner:
```bash
pip install sonarqube-scanner
```

2. Configure o sonar-project.properties:
```properties
sonar.projectKey=constrsw-lessons
sonar.projectName=ConstrSW Lessons Service
sonar.projectVersion=1.0
sonar.sources=.
sonar.python.version=3.9
sonar.host.url=http://localhost:9000
sonar.login=seu-token-aqui
```

3. Execute a análise:
```bash
sonar-scanner
```

## Integração com CI/CD

### GitHub Actions

```yaml
name: SonarQube Analysis
on: [push, pull_request]

jobs:
  sonarqube:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
      with:
        fetch-depth: 0
    
    - name: SonarQube Scan
      uses: sonarqube-quality-gate-action@master
      env:
        SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
        SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
      with:
        scannerHome: ${{ github.workspace }}/.sonar/scanner
        args: >
          -Dsonar.projectKey=constrsw-project
          -Dsonar.sources=.
          -Dsonar.host.url=${{ secrets.SONAR_HOST_URL }}
          -Dsonar.login=${{ secrets.SONAR_TOKEN }}
```

## Métricas Importantes

### Qualidade do Código
- **Bugs**: Problemas que podem causar falhas
- **Vulnerabilidades**: Problemas de segurança
- **Code Smells**: Problemas de manutenibilidade
- **Technical Debt**: Tempo estimado para corrigir problemas

### Cobertura
- **Cobertura de Linhas**: % de linhas executadas pelos testes
- **Cobertura de Branches**: % de branches executados pelos testes

### Duplicação
- **Duplicated Lines**: Linhas de código duplicadas
- **Duplicated Blocks**: Blocos de código duplicados

## Troubleshooting

### Problemas Comuns

1. **SonarQube não inicia**
   - Verifique se o PostgreSQL está rodando
   - Verifique se o banco 'sonar' foi criado
   - Verifique os logs: `docker-compose logs sonarqube`

2. **Erro de memória**
   - Aumente a memória do Docker
   - Configure variáveis de ambiente para limitar uso de memória

3. **Scanner não encontra o servidor**
   - Verifique se a URL está correta
   - Verifique se o token está válido
   - Verifique se o projeto já existe no SonarQube

### Logs

```bash
# Ver logs do SonarQube
docker-compose logs sonarqube

# Ver logs em tempo real
docker-compose logs -f sonarqube
```

## Recursos Adicionais

- [Documentação Oficial](https://docs.sonarqube.org/)
- [Regras de Qualidade](https://rules.sonarsource.com/)
- [Plugins Disponíveis](https://docs.sonarqube.org/latest/setup/install-plugin/)
- [API REST](https://docs.sonarqube.org/latest/extend/web-api/)

## Configuração Avançada

### Plugins Recomendados

- **SonarJava**: Análise avançada para Java
- **SonarJS**: Análise para JavaScript/TypeScript
- **SonarPython**: Análise para Python
- **SonarC#**: Análise para C#
- **SonarGo**: Análise para Go

### Configuração de Qualidade Gates

Configure regras de qualidade no SonarQube:

1. Acesse: Administration > Quality Gates
2. Configure critérios como:
   - Coverage > 80%
   - Duplicated Lines < 3%
   - Bugs = 0
   - Vulnerabilities = 0

### Backup e Restore

```bash
# Backup
docker-compose exec sonarqube tar -czf /opt/sonarqube/data/backup.tar.gz /opt/sonarqube/data

# Restore
docker-compose exec sonarqube tar -xzf /opt/sonarqube/data/backup.tar.gz -C /
```

# Configuração Automática do SonarQube

Este diretório contém scripts para configurar automaticamente o SonarQube para todos os serviços da solução ConstrSW.

## Arquivos Disponíveis

### `setup-sonar.ps1`
Script PowerShell para configurar automaticamente o SonarQube:
- Cria usuário personalizado
- Gera token de autenticação
- Atualiza o arquivo `.env` da raiz do projeto com as variáveis necessárias

### `Dockerfile`
Dockerfile otimizado para o SonarQube:
- Baseado na imagem oficial SonarQube 10.4 Community
- Configurações de memória otimizadas para desenvolvimento
- Integração com PostgreSQL
- Health check configurado

### `sonar.properties`
Arquivo de configuração do SonarQube:
- Configurações de banco de dados
- Configurações de segurança
- Configurações de performance
- Configurações de logs
- **Suporte a variáveis de ambiente** com valores padrão

### `sonar.env.example`
Arquivo de exemplo com todas as variáveis de ambiente disponíveis:
- Configurações do servidor web
- Configurações de banco de dados
- Configurações de memória Java
- Configurações de segurança e performance

### `init-sonar.sh`
Script de inicialização:
- Configura banco de dados PostgreSQL
- Cria usuário e banco de dados necessários
- Aguarda dependências estarem prontas

## Como Usar

### 1. Pré-requisitos

- Docker e Docker Compose instalados
- PostgreSQL rodando (para persistência de dados)
- PowerShell 5.1 ou superior (para scripts Windows)

### 2. Build da Imagem Docker

```bash
# Navegar para o diretório do SonarQube
cd backend/utils/sonarqube

# Build da imagem
docker build -t constrsw-sonarqube .

# Ou usando docker-compose (recomendado)
docker-compose up -d sonarqube
```

### 3. Configuração Automática

```powershell
# Navegar para o diretório do script
cd backend/utils/sonarqube

# Executar com parâmetros padrão
.\setup-sonar.ps1

# Ou com parâmetros personalizados
.\setup-sonar.ps1 -SonarUrl "http://localhost:9000" -NewUser "meu_usuario" -NewPassword "minha_senha"
```

### 4. Parâmetros Disponíveis

| Parâmetro | Padrão | Descrição |
|-----------|--------|-----------|
| `SonarUrl` | `http://localhost:9000` | URL do SonarQube |
| `AdminUser` | `admin` | Usuário admin do SonarQube |
| `AdminPassword` | `a12345678` | Senha do usuário admin |
| `NewUser` | `constrsw` | Nome do novo usuário a ser criado |
| `NewPassword` | `a12345678` | Senha do novo usuário |
| `NewEmail` | `constrsw@example.com` | Email do novo usuário |
| `TokenName` | `constrsw-token` | Nome do token a ser gerado |

### 5. O que o Script Faz

1. **Aguarda o SonarQube estar disponível** (até 5 minutos)
2. **Cria o usuário** especificado (se não existir)
3. **Gera um token** de autenticação para o usuário
4. **Atualiza o arquivo `.env** da raiz do projeto com as variáveis:
   - `SONARQUBE_URL`
   - `SONARQUBE_USER`
   - `SONARQUBE_PASSWORD`
   - `SONAR_TOKEN`

### 6. Variáveis Geradas

Após a execução, o arquivo `.env` da raiz será atualizado com:

```env
# SonarQube
SONARQUBE_URL=http://localhost:9000
SONARQUBE_USER=constrsw
SONARQUBE_PASSWORD=constrsw123
SONAR_TOKEN=abc123def456...
```

### 7. Uso nos Serviços

Essas variáveis podem ser usadas em:
- **Docker Compose**: Referenciadas como `${SONAR_TOKEN}`
- **Scripts de teste**: Para análise de qualidade de código
- **CI/CD**: Para integração contínua

## Exemplo de Uso no Docker Compose

```yaml
services:
  sonarqube:
    build: ./backend/utils/sonarqube
    ports:
      - "9000:9000"
    env_file:
      - ./backend/utils/sonarqube/sonar.env
    environment:
      # Configurações específicas podem sobrescrever o arquivo .env
      - SONAR_JDBC_URL=jdbc:postgresql://postgresql:5432/sonar
      - SONAR_JDBC_USERNAME=sonar
      - SONAR_JDBC_PASSWORD=sonar
    depends_on:
      - postgresql
    volumes:
      - sonarqube_data:/opt/sonarqube/data
      - sonarqube_extensions:/opt/sonarqube/extensions
      - sonarqube_logs:/opt/sonarqube/logs

  meu-servico:
    environment:
      - SONAR_TOKEN=${SONAR_TOKEN}
      - SONARQUBE_URL=${SONARQUBE_URL}
```

## Exemplo de Uso em Scripts de Teste

```powershell
# No script run-tests.ps1 de qualquer serviço
if ($env:SONAR_TOKEN) {
    mvn sonar:sonar -Dsonar.token=$env:SONAR_TOKEN
}
```

## Variáveis de Ambiente

O SonarQube suporta configuração via variáveis de ambiente. Todas as configurações do `sonar.properties` podem ser sobrescritas usando variáveis de ambiente.

### Sintaxe das Variáveis

```properties
# No sonar.properties
sonar.web.port=${SONAR_WEB_PORT:9000}
```

- `${VARIABLE_NAME}` - Usa o valor da variável de ambiente
- `${VARIABLE_NAME:default_value}` - Usa o valor da variável ou o padrão se não definida

### Principais Variáveis

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `SONAR_WEB_HOST` | `0.0.0.0` | Host do servidor web |
| `SONAR_WEB_PORT` | `9000` | Porta do servidor web |
| `SONAR_JDBC_URL` | `jdbc:postgresql://postgresql:5432/sonar` | URL do banco de dados |
| `SONAR_JDBC_USERNAME` | `sonar` | Usuário do banco de dados |
| `SONAR_JDBC_PASSWORD` | `sonar` | Senha do banco de dados |
| `SONAR_WEB_JAVAOPTS` | `-Xmx512m -Xms128m` | Opções Java para o servidor web |
| `SONAR_CE_JAVAOPTS` | `-Xmx512m -Xms128m` | Opções Java para Compute Engine |
| `SONAR_SEARCH_JAVAOPTS` | `-Xmx512m -Xms128m` | Opções Java para Elasticsearch |

### Como Usar

1. **Copie o arquivo de exemplo:**
   ```bash
   cp sonar.env.example sonar.env
   ```

2. **Edite as variáveis necessárias:**
   ```bash
   # Exemplo: aumentar memória para produção
   SONAR_WEB_JAVAOPTS=-Xmx2g -Xms512m
   SONAR_CE_JAVAOPTS=-Xmx2g -Xms512m
   SONAR_SEARCH_JAVAOPTS=-Xmx2g -Xms512m
   ```

3. **Use no Docker Compose:**
   ```yaml
   services:
     sonarqube:
       env_file:
         - ./sonar.env
   ```

## Troubleshooting

### Erro: "SonarQube não ficou disponível"
- Verifique se o SonarQube está rodando
- Confirme a URL e porta corretas
- Aguarde alguns minutos para o SonarQube inicializar completamente

### Erro: "Usuário já existe"
- Normal, o script continua e gera um novo token
- Se quiser um usuário diferente, use o parâmetro `-NewUser`

### Erro: "Arquivo .env não encontrado"
- Execute o script a partir do diretório correto
- Verifique se o arquivo `.env` existe na raiz do projeto

## Segurança

- O token gerado tem acesso completo ao SonarQube
- Mantenha o arquivo `.env` seguro e não o commite no repositório
- Considere usar variáveis de ambiente do sistema para produção 