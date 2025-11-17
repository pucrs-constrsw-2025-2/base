# Guia de Testes - Employees Service

Este documento descreve a estratégia de testes automatizados para o serviço Employees.

## Estrutura de Testes

O projeto utiliza uma abordagem de testes em camadas:

1. **Testes Unitários**: Testam componentes isolados (Services, Mappers)
2. **Testes de Integração**: Testam a integração entre componentes e o banco de dados

## Tecnologias Utilizadas

- **JUnit 5**: Framework de testes
- **Mockito**: Para mockar dependências em testes unitários
- **Testcontainers**: Para testes de integração com MongoDB real
- **JaCoCo**: Para análise de cobertura de código
- **Spring Boot Test**: Para testes de integração com Spring

## Executando os Testes

### Executar todos os testes

```bash
cd backend/employees
mvn test
```

### Executar apenas testes unitários

```bash
mvn test -Dtest=*Test
```

### Executar apenas testes de integração

```bash
mvn test -Dtest=*IntegrationTest
```

### Executar testes com cobertura

```bash
mvn clean test jacoco:report
```

O relatório de cobertura será gerado em: `target/site/jacoco/index.html`

### Verificar cobertura mínima

```bash
mvn clean test jacoco:check
```

A cobertura mínima configurada é de **80%** de linhas de código.

## Estrutura de Arquivos de Teste

```
src/test/
├── java/
│   └── com/constrsw/employees/
│       ├── service/
│       │   └── EmployeeServiceTest.java          # Testes unitários do serviço
│       └── integration/
│           └── EmployeeControllerIntegrationTest.java  # Testes de integração
└── resources/
    └── application-test.yml                       # Configuração para testes
```

## Tipos de Testes

### Testes Unitários

Os testes unitários (`EmployeeServiceTest`) testam a lógica de negócio do `EmployeeService` isoladamente, utilizando mocks para as dependências:

- Criação de funcionários
- Validação de contract number duplicado
- Listagem com paginação e busca
- Atualização e deleção
- Gerenciamento de tarefas

### Testes de Integração

Os testes de integração (`EmployeeControllerIntegrationTest`) testam o comportamento completo da API:

- Endpoints REST completos
- Integração com MongoDB usando Testcontainers
- Validação de requisições e respostas HTTP
- Tratamento de erros

## Testcontainers

Os testes de integração utilizam **Testcontainers** para criar uma instância real do MongoDB durante a execução dos testes. Isso garante que os testes sejam executados em um ambiente próximo ao de produção.

O container MongoDB é iniciado automaticamente antes dos testes e destruído após a execução.

## Cobertura de Código

### Requisitos de Cobertura

- **Mínimo**: 80% de cobertura de linhas por pacote
- **Ideal**: 90%+ de cobertura

### Visualizar Relatório

Após executar `mvn test jacoco:report`, abra o arquivo:
```
target/site/jacoco/index.html
```

## CI/CD

Os testes são executados automaticamente na pipeline de CI/CD do GitHub Actions:

1. **Test**: Executa todos os testes e gera relatórios de cobertura
2. **SonarQube**: Analisa a qualidade do código e cobertura
3. **Build**: Constrói a imagem Docker (apenas em push para branch principal)

### Workflow

O workflow está configurado em `.github/workflows/employees-ci.yml` e é acionado quando:
- Há push para a branch `grupo7`
- Há pull request para a branch `grupo7`
- Arquivos em `backend/employees/**` são modificados

## Boas Práticas

1. **Nomenclatura**: Use nomes descritivos que expliquem o que está sendo testado
2. **Arrange-Act-Assert**: Organize os testes em três seções claras
3. **Testes Independentes**: Cada teste deve ser independente e poder ser executado isoladamente
4. **Mocks**: Use mocks apenas quando necessário, prefira objetos reais quando possível
5. **Cobertura**: Busque cobrir casos de sucesso e falha
6. **Manutenibilidade**: Mantenha os testes simples e fáceis de entender

## Exemplo de Teste

```java
@Test
@DisplayName("Deve criar um funcionário com sucesso")
void shouldCreateEmployeeSuccessfully() {
    // Arrange
    when(employeeRepository.existsByContractNumber(12345L)).thenReturn(false);
    when(employeeMapper.toEntity(createRequest)).thenReturn(employee);
    when(employeeRepository.save(any(Employee.class))).thenReturn(employee);
    
    EmployeeResponse expectedResponse = new EmployeeResponse();
    when(employeeMapper.toResponse(employee)).thenReturn(expectedResponse);

    // Act
    EmployeeResponse result = employeeService.createEmployee(createRequest);

    // Assert
    assertNotNull(result);
    verify(employeeRepository).save(employee);
}
```

## Troubleshooting

### Testes falhando com Testcontainers

Se os testes de integração falharem, verifique:
- Docker está rodando
- Há espaço suficiente no disco
- A imagem do MongoDB está disponível

#### Erro: "Can not connect to Ryuk"

Se você receber erros relacionados ao Ryuk (gerenciador de limpeza do Testcontainers), especialmente ao executar testes dentro de containers Docker, o Ryuk está **automaticamente desabilitado** através de:

1. **Configuração no `pom.xml`**: A propriedade `TESTCONTAINERS_RYUK_DISABLED=true` é definida no Maven Surefire Plugin
2. **Arquivo `.testcontainers.properties`**: Configuração adicional com `ryuk.container.enabled=false`
3. **Variável de ambiente**: Pode ser passada no comando Docker como backup

**Comando para executar testes dentro de container Docker:**

```bash
# Windows PowerShell
docker run --rm `
  -v /var/run/docker.sock:/var/run/docker.sock `
  -e TESTCONTAINERS_RYUK_DISABLED=true `
  -v "C:\Users\EduardoArruda\Documents\Pessoal\src\pucrs\constrsw\constrsw-2025-2\backend\employees:/app" `
  -w /app `
  maven:3.9-eclipse-temurin-21-alpine `
  mvn test

# Linux/Mac
docker run --rm \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -e TESTCONTAINERS_RYUK_DISABLED=true \
  -v "$(pwd)/backend/employees:/app" \
  -w /app \
  maven:3.9-eclipse-temurin-21-alpine \
  mvn test
```

**Nota**: O Ryuk é usado para limpeza automática de containers. Quando desabilitado, os containers ainda serão limpos quando o container de teste for finalizado. A desabilitação é necessária quando executando testes dentro de containers Docker devido a problemas de rede.

### Cobertura abaixo do mínimo

Se a cobertura estiver abaixo de 80%:
- Adicione mais testes para cobrir métodos não testados
- Verifique se há código morto que pode ser removido
- Considere aumentar a cobertura gradualmente

## Referências

- [JUnit 5 Documentation](https://junit.org/junit5/docs/current/user-guide/)
- [Mockito Documentation](https://javadoc.io/doc/org.mockito/mockito-core/latest/org/mockito/Mockito.html)
- [Testcontainers Documentation](https://www.testcontainers.org/)
- [JaCoCo Documentation](https://www.jacoco.org/jacoco/trunk/doc/)

