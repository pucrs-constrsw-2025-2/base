# Como Executar os Testes - Employees Service

Este guia mostra as diferentes formas de executar os testes automatizados do serviço Employees.

## 📋 Pré-requisitos

- **Java 21** instalado
- **Maven 3.9+** instalado
- **Docker** instalado e rodando (para testes de integração)

## 🚀 Opção 1: Executar Localmente (Recomendado)

### Executar todos os testes

```bash
cd backend/employees
mvn test
```

### Executar apenas testes unitários

```bash
cd backend/employees
mvn test -Dtest=*Test
```

### Executar apenas testes de integração

```bash
cd backend/employees
mvn test -Dtest=*IntegrationTest
```

**Nota**: Os testes de integração precisam do Docker rodando para criar o container MongoDB via Testcontainers.

### Executar testes com cobertura

```bash
cd backend/employees
mvn clean test jacoco:report
```

O relatório de cobertura será gerado em: `target/site/jacoco/index.html`

### Verificar se a cobertura está acima do mínimo (80%)

```bash
cd backend/employees
mvn clean test jacoco:check
```

## 🐳 Opção 2: Executar Dentro de Container Docker

Esta opção é útil quando você não tem Java/Maven instalado localmente ou quer garantir que os testes rodem no mesmo ambiente da CI/CD.

### Windows PowerShell

```powershell
docker run --rm `
  -v /var/run/docker.sock:/var/run/docker.sock `
  -e TESTCONTAINERS_RYUK_DISABLED=true `
  -v "C:\Users\EduardoArruda\Documents\Pessoal\src\pucrs\constrsw\constrsw-2025-2\backend\employees:/app" `
  -w /app `
  maven:3.9-eclipse-temurin-21-alpine `
  mvn test
```

### Linux/Mac

```bash
docker run --rm \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -e TESTCONTAINERS_RYUK_DISABLED=true \
  -v "$(pwd)/backend/employees:/app" \
  -w /app \
  maven:3.9-eclipse-temurin-21-alpine \
  mvn test
```

### Executar testes com cobertura no container

```bash
docker run --rm \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -e TESTCONTAINERS_RYUK_DISABLED=true \
  -v "$(pwd)/backend/employees:/app" \
  -w /app \
  maven:3.9-eclipse-temurin-21-alpine \
  mvn clean test jacoco:report
```

## 📊 Ver Resultados

### Relatório de Testes

Após a execução, os relatórios estarão em:
- `target/surefire-reports/` - Relatórios de execução dos testes
- `target/site/jacoco/index.html` - Relatório de cobertura (após `jacoco:report`)

### Ver cobertura no navegador

```bash
# Windows
start target/site/jacoco/index.html

# Linux
xdg-open target/site/jacoco/index.html

# Mac
open target/site/jacoco/index.html
```

## 🔍 Executar Teste Específico

### Por nome da classe

```bash
mvn test -Dtest=EmployeeServiceTest
```

### Por nome do método

```bash
mvn test -Dtest=EmployeeServiceTest#shouldCreateEmployeeSuccessfully
```

## ⚙️ Opções Avançadas

### Executar testes em modo debug

```bash
mvn test -Dmaven.surefire.debug
```

### Executar testes com mais informações

```bash
mvn test -X
```

### Pular testes de integração

```bash
mvn test -Dtest=*Test
```

### Executar apenas testes que falharam anteriormente

```bash
mvn test -Dsurefire.rerunFailingTestsCount=2
```

## 🐛 Troubleshooting

### Erro: "Could not find a valid Docker environment"

**Causa**: Docker não está rodando ou Testcontainers não consegue acessar o Docker.

**Solução**:
1. Verifique se o Docker está rodando: `docker ps`
2. Para testes de integração, o Docker precisa estar acessível
3. Se executando dentro de container, certifique-se de montar o socket: `-v /var/run/docker.sock:/var/run/docker.sock`

### Erro: "Can not connect to Ryuk"

**Causa**: Problema de rede ao executar testes dentro de containers Docker.

**Solução**: O Ryuk já está desabilitado automaticamente via configuração no `pom.xml`. Se ainda ocorrer, passe a variável de ambiente:
```bash
-e TESTCONTAINERS_RYUK_DISABLED=true
```

### Testes muito lentos

**Causa**: Download de imagens Docker ou dependências Maven.

**Solução**:
1. As imagens são baixadas apenas na primeira execução
2. Use cache do Maven: `mvn test -o` (modo offline, se dependências já estiverem em cache)
3. Para testes unitários, use: `mvn test -Dtest=*Test` (mais rápido, não precisa do Docker)

## 📝 Exemplos Práticos

### Desenvolvimento rápido (apenas testes unitários)

```bash
cd backend/employees
mvn test -Dtest=*Test
```

### Antes de fazer commit (todos os testes + cobertura)

```bash
cd backend/employees
mvn clean test jacoco:report jacoco:check
```

### Verificar cobertura sem executar testes novamente

```bash
cd backend/employees
mvn jacoco:report
```

### Executar testes em modo silencioso

```bash
cd backend/employees
mvn test -q
```

## 🔗 Referências

- [Documentação completa de testes](TESTING.md)
- [JUnit 5 Documentation](https://junit.org/junit5/docs/current/user-guide/)
- [Testcontainers Documentation](https://www.testcontainers.org/)

