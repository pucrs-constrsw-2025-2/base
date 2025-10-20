# JSON Schemas para API de Funcionários (Employees)

Este diretório contém os JSON Schemas para a API REST de gerenciamento de funcionários, baseados no diagrama de classes UML fornecido.

## Arquivos

- `employee-schemas.json` - Schemas JSON para validação de dados
- `employee-examples.json` - Exemplos de uso e documentação da API
- `README.md` - Esta documentação

## Estrutura dos Schemas

### Classes Principais

#### Employee
Representa um funcionário com os seguintes atributos:
- `_id`: UUID (identificador único)
- `contract_number`: Int64 (número do contrato)
- `name`: String (nome completo)
- `role`: String (cargo/função)
- `salary`: Decimal128 (salário)
- `organizational_unit`: String (unidade organizacional)
- `tasks`: Array de Task (tarefas do funcionário)
- `room`: Objeto com referência à sala (via API externa)

#### Task
Representa uma tarefa com os seguintes atributos:
- `_id`: UUID (identificador único)
- `description`: String (descrição da tarefa)
- `start_date`: Date (data de início)
- `expected_end_date`: Date (data esperada de conclusão)
- `actual_end_date`: Date (data real de conclusão, pode ser null)

### Schemas de Validação

#### EmployeeCreateRequest
Schema para criação de funcionários (POST /employees)
- Campos obrigatórios: contract_number, name, role
- Campos opcionais: salary, organizational_unit, room

#### EmployeeUpdateRequest
Schema para atualização de funcionários (PUT/PATCH /employees/{id})
- Todos os campos são opcionais
- Mínimo de 1 propriedade deve ser fornecida

#### EmployeeResponse
Schema para resposta de funcionários (GET /employees/{id})
- Inclui todos os campos do Employee
- Inclui array de tasks
- Inclui referência à room

#### EmployeeListResponse
Schema para listagem paginada de funcionários (GET /employees)
- Array de employees
- Metadados de paginação (total, page, limit)

#### TaskCreateRequest
Schema para criação de tarefas (POST /employees/{id}/tasks)
- Campos obrigatórios: description, start_date, expected_end_date
- Campo opcional: actual_end_date

#### TaskUpdateRequest
Schema para atualização de tarefas (PUT /employees/{employee_id}/tasks/{task_id})
- Todos os campos são opcionais
- Mínimo de 1 propriedade deve ser fornecida

## Persistência

- **Employee** e **Task**: Persistidos no MongoDB na collection "Employees"
- **Room**: Referência via API externa `{{base_url}}/rooms` usando `_id_room`

## Relacionamentos

1. **Employee → Task**: Composição (1 para 0..*)
   - Um funcionário pode ter zero ou mais tarefas
   - Cada tarefa pertence a exatamente um funcionário

2. **Employee → Room**: Agregação (0..* para 1)
   - Um funcionário pode estar associado a zero ou mais salas
   - Cada sala está associada a exatamente um funcionário

## Endpoints da API

### Funcionários
- `GET /employees` - Listar funcionários (com paginação)
- `GET /employees/{id}` - Obter funcionário por ID
- `POST /employees` - Criar funcionário
- `PUT /employees/{id}` - Atualizar funcionário completamente
- `PATCH /employees/{id}` - Atualizar funcionário parcialmente
- `DELETE /employees/{id}` - Deletar funcionário

### Tarefas
- `GET /employees/{id}/tasks` - Listar tarefas do funcionário
- `POST /employees/{id}/tasks` - Criar tarefa para funcionário
- `PUT /employees/{employee_id}/tasks/{task_id}` - Atualizar tarefa
- `DELETE /employees/{employee_id}/tasks/{task_id}` - Deletar tarefa

## Validações

### Employee
- `name`: 1-255 caracteres (obrigatório)
- `role`: 1-100 caracteres (obrigatório)
- `organizational_unit`: 1-100 caracteres (opcional)
- `salary`: valor numérico >= 0 (opcional)
- `contract_number`: número inteiro de 64 bits (obrigatório)

### Task
- `description`: 1-1000 caracteres
- `start_date`, `expected_end_date`, `actual_end_date`: formato de data ISO 8601

## Uso

Os schemas podem ser utilizados para:
1. Validação de entrada em APIs REST
2. Documentação automática (OpenAPI/Swagger)
3. Geração de código cliente
4. Testes de integração

## Exemplos

Consulte o arquivo `employee-examples.json` para exemplos completos de uso de cada schema.
