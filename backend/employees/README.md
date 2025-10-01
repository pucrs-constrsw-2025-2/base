# Employees API

REST API para gerenciamento de funcionários e tarefas, desenvolvida com Spring Boot e MongoDB.

## Características

- **Framework**: Spring Boot 3.2.0
- **Java**: 17
- **Banco de Dados**: MongoDB
- **Validação**: Bean Validation (Jakarta)
- **Documentação**: JSON Schemas

## Endpoints da API

### Funcionários

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/v1/employees` | Criar funcionário |
| GET | `/api/v1/employees` | Listar funcionários (com paginação e busca) |
| GET | `/api/v1/employees/{id}` | Obter funcionário por ID |
| PUT | `/api/v1/employees/{id}` | Atualizar funcionário completamente |
| PATCH | `/api/v1/employees/{id}` | Atualizar funcionário parcialmente |
| DELETE | `/api/v1/employees/{id}` | Deletar funcionário |

### Tarefas

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/employees/{id}/tasks` | Listar tarefas do funcionário |
| POST | `/api/v1/employees/{id}/tasks` | Criar tarefa para funcionário |
| GET | `/api/v1/employees/{employeeId}/tasks/{taskId}` | Obter tarefa específica |
| PUT | `/api/v1/employees/{employeeId}/tasks/{taskId}` | Atualizar tarefa completamente |
| PATCH | `/api/v1/employees/{employeeId}/tasks/{taskId}` | Atualizar tarefa parcialmente |
| DELETE | `/api/v1/employees/{employeeId}/tasks/{taskId}` | Deletar tarefa |

## Parâmetros de Query

### GET /employees
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 10)
- `search` (opcional): Busca por contract_number, name ou organizational_unit

### GET /employees/{id}/tasks
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 10)
- `description` (opcional): Filtrar por descrição da tarefa
- `startDate` (opcional): Data de início do período (formato: YYYY-MM-DD)
- `endDate` (opcional): Data de fim do período (formato: YYYY-MM-DD)

## Estrutura de Dados

### Employee
```json
{
  "id": "string (UUID)",
  "contractNumber": "number (int64)",
  "name": "string (1-255 caracteres)",
  "role": "string (1-100 caracteres)",
  "salary": "number (decimal, opcional)",
  "organizationalUnit": "string (1-100 caracteres, opcional)",
  "tasks": "array de Task (opcional)",
  "room": {
    "idRoom": "string (UUID, opcional)"
  }
}
```

### Task
```json
{
  "id": "string (UUID)",
  "description": "string (1-1000 caracteres)",
  "startDate": "string (data ISO 8601)",
  "expectedEndDate": "string (data ISO 8601)",
  "actualEndDate": "string (data ISO 8601, opcional)",
  "employeeId": "string (UUID)"
}
```

## Configuração

### Variáveis de Ambiente

```yaml
MONGODB_HOST: localhost
MONGODB_PORT: 27017
MONGODB_DATABASE: Employees
MONGODB_USERNAME: admin
MONGODB_PASSWORD: password
```

### Aplicação

```yaml
server:
  port: 8080
  servlet:
    context-path: /api/v1
```

## Execução

### Local (Maven)
```bash
mvn spring-boot:run
```

### Docker
```bash
docker build -t constrsw/employees-api .
docker run -p 8080:8080 constrsw/employees-api
```

### Docker Compose
```bash
docker-compose up employees-api
```

## Validações

- **Contract Number**: Único, obrigatório
- **Name**: 1-255 caracteres, obrigatório
- **Role**: 1-100 caracteres, obrigatório
- **Salary**: Valor não-negativo, opcional
- **Organizational Unit**: 1-100 caracteres, opcional
- **Task Description**: 1-1000 caracteres, obrigatório
- **Dates**: Formato ISO 8601 (YYYY-MM-DD)

## Tratamento de Erros

A API retorna erros estruturados no formato:

```json
{
  "error": "Mensagem de erro",
  "code": "CÓDIGO_DO_ERRO",
  "timestamp": "2024-01-01T12:00:00",
  "details": {
    "campo": "Detalhes específicos do erro"
  }
}
```

### Códigos de Erro
- `EMPLOYEE_NOT_FOUND`: Funcionário não encontrado
- `DUPLICATE_CONTRACT_NUMBER`: Número de contrato duplicado
- `VALIDATION_ERROR`: Erro de validação
- `INVALID_PARAMETER_TYPE`: Tipo de parâmetro inválido
- `INVALID_ARGUMENT`: Argumento inválido
- `INTERNAL_SERVER_ERROR`: Erro interno do servidor

## Health Check

A API expõe endpoints de monitoramento:

- `GET /api/v1/actuator/health` - Status da aplicação
- `GET /api/v1/actuator/info` - Informações da aplicação
- `GET /api/v1/actuator/metrics` - Métricas da aplicação

## Exemplos de Uso

### Criar Funcionário
```bash
curl -X POST http://localhost:8080/api/v1/employees \
  -H "Content-Type: application/json" \
  -d '{
    "contractNumber": 12345,
    "name": "João Silva",
    "role": "Desenvolvedor",
    "salary": 5000.00,
    "organizationalUnit": "TI"
  }'
```

### Listar Funcionários
```bash
curl "http://localhost:8080/api/v1/employees?page=1&limit=10&search=João"
```

### Criar Tarefa
```bash
curl -X POST http://localhost:8080/api/v1/employees/{employeeId}/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Implementar nova funcionalidade",
    "startDate": "2024-01-01",
    "expectedEndDate": "2024-01-15"
  }'
```






