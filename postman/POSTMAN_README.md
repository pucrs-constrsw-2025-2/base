# Postman Collections - Employees API

Este diretório contém as collections e environments do Postman para testar a API de funcionários.

## Arquivos

### Collections
- **`EmployeesAPI.postman_collection.json`** - Collection principal com todos os endpoints
- **`EmployeesAPI-Examples.postman_collection.json`** - Collection com exemplos detalhados e cenários específicos

### Environment
- **`EmployeesAPI.postman_environment.json`** - Environment com variáveis configuradas

## Como Usar

### 1. Importar no Postman

1. Abra o Postman
2. Clique em "Import" no canto superior esquerdo
3. Selecione os arquivos `.json` para importar:
   - `EmployeesAPI.postman_collection.json`
   - `EmployeesAPI.postman_environment.json`
   - `EmployeesAPI-Examples.postman_collection.json` (opcional)

### 2. Configurar Environment

1. Selecione o environment "Employees API Environment"
2. Verifique se a variável `base_url` está configurada corretamente:
   - **Desenvolvimento local**: `http://localhost:8080/api/v1`
   - **Docker**: `http://localhost:8080/api/v1`
   - **Produção**: Ajuste conforme necessário

### 3. Executar Requests

#### Collection Principal
A collection principal contém todos os endpoints organizados em pastas:

- **Employees**: Endpoints para gerenciamento de funcionários
- **Tasks**: Endpoints para gerenciamento de tarefas
- **Health Check**: Endpoints de monitoramento

#### Collection de Exemplos
A collection de exemplos contém cenários específicos:

- **Employee Scenarios**: Diferentes formas de criar e buscar funcionários
- **Task Scenarios**: Diferentes formas de criar e gerenciar tarefas
- **Error Scenarios**: Testes de validação e tratamento de erros

## Endpoints Disponíveis

### Funcionários
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/employees` | Criar funcionário |
| GET | `/employees` | Listar funcionários (com paginação e busca) |
| GET | `/employees/{id}` | Obter funcionário por ID |
| PUT | `/employees/{id}` | Atualizar funcionário completamente |
| PATCH | `/employees/{id}` | Atualizar funcionário parcialmente |
| DELETE | `/employees/{id}` | Deletar funcionário |

### Tarefas
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/employees/{id}/tasks` | Listar tarefas do funcionário |
| POST | `/employees/{id}/tasks` | Criar tarefa para funcionário |
| GET | `/employees/{employeeId}/tasks/{taskId}` | Obter tarefa específica |
| PUT | `/employees/{employeeId}/tasks/{taskId}` | Atualizar tarefa completamente |
| PATCH | `/employees/{employeeId}/tasks/{taskId}` | Atualizar tarefa parcialmente |
| DELETE | `/employees/{employeeId}/tasks/{taskId}` | Deletar tarefa |

## Parâmetros de Query

### GET /employees
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 10)
- `search` (opcional): Busca por contract_number, name ou organizational_unit

### GET /employees/{id}/tasks
- `page` (opcional): Número da página (padrão: 1)
- `limit` (opcional): Itens por página (padrão: 10)
- `description` (opcional): Filtrar por descrição da tarefa
- `startDate` (opcional): Data de início do período (YYYY-MM-DD)
- `endDate` (opcional): Data de fim do período (YYYY-MM-DD)

## Variáveis do Environment

### Principais
- `base_url`: URL base da API
- `employee_id`: ID do funcionário para testes
- `task_id`: ID da tarefa para testes

### Dados de Teste
- `contract_number`: Número do contrato
- `employee_name`: Nome do funcionário
- `employee_role`: Cargo do funcionário
- `employee_salary`: Salário do funcionário
- `organizational_unit`: Unidade organizacional
- `room_id`: ID da sala
- `task_description`: Descrição da tarefa
- `start_date`: Data de início
- `expected_end_date`: Data esperada de fim
- `actual_end_date`: Data real de fim

### Parâmetros de Paginação
- `page`: Número da página
- `limit`: Limite de itens por página
- `search_term`: Termo de busca
- `date_range_start`: Data de início do período
- `date_range_end`: Data de fim do período

## Scripts Automáticos

### Pre-request Scripts
- Geração automática de UUIDs para novas entidades
- Configuração de variáveis dinâmicas

### Test Scripts
- Validação de códigos de status HTTP
- Verificação de tempo de resposta
- Validação de headers
- Extração automática de IDs das respostas

## Exemplos de Uso

### 1. Criar Funcionário
```json
POST /employees
{
  "contractNumber": 12345,
  "name": "João Silva",
  "role": "Desenvolvedor Senior",
  "salary": 8500.50,
  "organizationalUnit": "TI",
  "room": {
    "idRoom": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

### 2. Buscar Funcionários
```
GET /employees?search=João&page=1&limit=10
```

### 3. Criar Tarefa
```json
POST /employees/{employee_id}/tasks
{
  "description": "Implementar nova funcionalidade",
  "startDate": "2024-01-01",
  "expectedEndDate": "2024-01-15"
}
```

### 4. Filtrar Tarefas por Período
```
GET /employees/{employee_id}/tasks?startDate=2024-01-01&endDate=2024-12-31
```

## Validações Testadas

### Funcionários
- Campos obrigatórios (contractNumber, name, role)
- Campos opcionais (salary, organizationalUnit, room)
- Unicidade do contractNumber
- Validação de tamanhos de string
- Validação de valores numéricos

### Tarefas
- Campos obrigatórios (description, startDate, expectedEndDate)
- Campo opcional (actualEndDate)
- Validação de formato de datas (YYYY-MM-DD)
- Validação de tamanho da descrição (1-1000 caracteres)

## Códigos de Erro

- **400 Bad Request**: Dados inválidos ou campos obrigatórios ausentes
- **404 Not Found**: Recurso não encontrado
- **409 Conflict**: Número de contrato duplicado
- **500 Internal Server Error**: Erro interno do servidor

## Health Check

A collection inclui endpoints para monitoramento:

- `GET /actuator/health` - Status da aplicação
- `GET /actuator/info` - Informações da aplicação

## Dicas de Uso

1. **Execute os requests em ordem**: Crie um funcionário antes de criar tarefas
2. **Use as variáveis**: Os IDs são extraídos automaticamente das respostas
3. **Teste diferentes cenários**: Use a collection de exemplos para casos específicos
4. **Monitore os logs**: Verifique o console do Postman para erros
5. **Valide as respostas**: Os scripts de teste verificam automaticamente as respostas

## Troubleshooting

### Erro de Conexão
- Verifique se a API está rodando
- Confirme a URL base no environment
- Verifique se a porta 8080 está disponível

### Erro 404
- Verifique se o ID do funcionário existe
- Execute primeiro o request de listagem

### Erro de Validação
- Verifique se todos os campos obrigatórios estão preenchidos
- Confirme o formato das datas (YYYY-MM-DD)
- Verifique os tamanhos dos campos de texto

