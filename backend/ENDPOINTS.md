# Lista Completa de Endpoints - Todos os Serviços

Este documento lista TODOS os endpoints de cada serviço (exceto o BFF).

**Nota:** Todos os endpoints estão prefixados com `/api/v1` (exceto onde indicado).

---

## 1. OAuth Service (FastAPI - Python)

**Base URL:** `http://oauth:8000` (interno) / `http://localhost:8180` (externo)

### Autenticação
- `POST /api/v1/login` - Autenticação de usuário (username, password)
- `POST /api/v1/refresh` - Renovação de access token (refresh_token)
- `POST /api/v1/validate` - Validação de access token (Bearer token no header)

### Usuários
- `POST /api/v1/users` - Criar um novo usuário
- `GET /api/v1/users` - Listar todos os usuários (query: `enabled`)
- `GET /api/v1/users/{userId}` - Buscar usuário por ID
- `GET /api/v1/users/{userId}/roles` - Listar roles de um usuário
- `PUT /api/v1/users/{userId}` - Atualizar usuário (completo)
- `PATCH /api/v1/users/{userId}` - Atualizar senha de um usuário
- `DELETE /api/v1/users/{userId}` - Desativar usuário (exclusão lógica)
- `POST /api/v1/users/{userId}/roles` - Atribuir roles a um usuário
- `DELETE /api/v1/users/{userId}/roles` - Remover roles de um usuário

### Roles
- `POST /api/v1/roles` - Criar um novo role
- `GET /api/v1/roles` - Listar todos os roles (query: `enabled`)
- `GET /api/v1/roles/{roleId}` - Buscar role por ID
- `PUT /api/v1/roles/{roleId}` - Atualizar role (completo)
- `PATCH /api/v1/roles/{roleId}` - Atualizar role (parcial)
- `DELETE /api/v1/roles/{roleId}` - Excluir role

### Health & Metrics
- `GET /api/v1/health` - Health check
- `GET /api/v1/metrics` - Métricas Prometheus

---

## 2. Employees Service (Spring Boot - Java)

**Base URL:** `http://employees:8080` (interno) / `http://localhost:8185` (externo)

**Nota:** Este serviço usa `context-path: /api/v1`, então todas as rotas já incluem esse prefixo.

### Funcionários
- `POST /api/v1/employees` - Criar um novo funcionário
- `GET /api/v1/employees` - Listar funcionários (query: `page`, `limit`, `search`)
- `GET /api/v1/employees/{employeeId}` - Buscar funcionário por ID
- `PUT /api/v1/employees/{employeeId}` - Atualizar funcionário (completo)
- `PATCH /api/v1/employees/{employeeId}` - Atualizar funcionário (parcial)
- `DELETE /api/v1/employees/{employeeId}` - Deletar funcionário

### Tarefas (Sub-recurso de Funcionários)
- `GET /api/v1/employees/{employeeId}/tasks` - Listar tarefas de um funcionário (query: `page`, `limit`, `description`, `startDate`, `endDate`)
- `POST /api/v1/employees/{employeeId}/tasks` - Criar tarefa para um funcionário
- `GET /api/v1/employees/{employeeId}/tasks/{taskId}` - Buscar tarefa específica
- `PUT /api/v1/employees/{employeeId}/tasks/{taskId}` - Atualizar tarefa (completo)
- `PATCH /api/v1/employees/{employeeId}/tasks/{taskId}` - Atualizar tarefa (parcial)
- `DELETE /api/v1/employees/{employeeId}/tasks/{taskId}` - Deletar tarefa

### Health & Metrics
- `GET /api/v1/health` - Health check
- `GET /api/v1/metrics` - Métricas Prometheus

---

## 3. Classes Service (.NET - C#)

**Base URL:** `http://classes:8080` (interno) / `http://localhost:8190` (externo)

### Classes (Turmas)
- `POST /api/v1/classes` - Criar uma nova classe
- `GET /api/v1/classes` - Listar classes (query: `year`, `semester`, `course_id`, `page`, `size`)
- `GET /api/v1/classes/{classId}` - Buscar classe por ID
- `PUT /api/v1/classes/{classId}` - Atualizar classe (completo)
- `PATCH /api/v1/classes/{classId}` - Atualizar classe (parcial - Dictionary)
- `DELETE /api/v1/classes/{classId}` - Excluir classe

### Provas (Sub-recurso de Classes)
- `POST /api/v1/classes/{classId}/exams` - Adicionar prova à classe
- `GET /api/v1/classes/{classId}/exams` - Listar provas da classe
- `GET /api/v1/classes/{classId}/exams/{examId}` - Obter prova por ID
- `PUT /api/v1/classes/{classId}/exams/{examId}` - Atualizar prova (completo)
- `PATCH /api/v1/classes/{classId}/exams/{examId}` - Atualizar prova (parcial - Dictionary)
- `DELETE /api/v1/classes/{classId}/exams/{examId}` - Excluir prova

### Health & Metrics
- `GET /api/v1/health` - Health check
- `GET /api/v1/metrics` - Métricas Prometheus

---

## 4. Courses Service (FastAPI - Python)

**Base URL:** `http://courses:8080` (interno) / `http://localhost:8183` (externo)

### Cursos
- `POST /api/v1/courses` - Criar um novo curso
- `GET /api/v1/courses` - Listar cursos (query: `name`, `modality`)
- `GET /api/v1/courses/{courseId}` - Buscar curso por ID
- `PUT /api/v1/courses/{courseId}` - Atualizar curso (completo)
- `PATCH /api/v1/courses/{courseId}` - Atualizar curso (parcial)
- `DELETE /api/v1/courses/{courseId}` - Deletar curso

### Materiais (Sub-recurso de Cursos)
- `POST /api/v1/courses/{courseId}/materials` - Adicionar material a um curso
- `GET /api/v1/courses/{courseId}/materials` - Listar materiais de um curso (query: `name`)
- `GET /api/v1/courses/{courseId}/materials/{materialId}` - Buscar material específico
- `PUT /api/v1/courses/{courseId}/materials/{materialId}` - Atualizar material (completo)
- `PATCH /api/v1/courses/{courseId}/materials/{materialId}` - Atualizar material (parcial)
- `DELETE /api/v1/courses/{courseId}/materials/{materialId}` - Deletar material

### Turmas (Sub-recurso de Cursos)
- `GET /api/v1/courses/{courseId}/classes` - Buscar turmas de um curso (query: `semester`, `year`)

### Health & Metrics
- `GET /api/v1/health` - Health check
- `GET /api/v1/metrics` - Métricas Prometheus

---

## 5. Lessons Service (NestJS - TypeScript)

**Base URL:** `http://lessons:3000` (interno) / `http://localhost:8184` (externo)

### Aulas
- `POST /api/v1/lessons` - Criar uma nova aula
- `GET /api/v1/lessons` - Listar todas as aulas
- `GET /api/v1/lessons/{lessonId}` - Buscar aula por ID (UUID)
- `PUT /api/v1/lessons/{lessonId}` - Atualizar aula (completo)
- `PATCH /api/v1/lessons/{lessonId}` - Atualizar aula (parcial)
- `DELETE /api/v1/lessons/{lessonId}` - Deletar aula

### Assuntos (Sub-recurso de Aulas)
- `POST /api/v1/lessons/{lessonId}/subjects` - Criar assunto para uma aula
- `GET /api/v1/lessons/{lessonId}/subjects` - Listar assuntos de uma aula
- `GET /api/v1/lessons/{lessonId}/subjects/{subjectId}` - Buscar assunto específico
- `PUT /api/v1/lessons/{lessonId}/subjects/{subjectId}` - Atualizar assunto (completo)
- `PATCH /api/v1/lessons/{lessonId}/subjects/{subjectId}` - Atualizar assunto (parcial)
- `DELETE /api/v1/lessons/{lessonId}/subjects/{subjectId}` - Deletar assunto

### Health & Metrics
- `GET /api/v1/health` - Health check
- `GET /api/v1/metrics` - Métricas Prometheus

---

## 6. Professors Service (FastAPI - Python)

**Base URL:** `http://professors:8082` (interno) / `http://localhost:8182` (externo)

### Professores
- `POST /api/v1/professors/` - Criar um novo professor
- `GET /api/v1/professors/` - Buscar professores (query: `name`, `status`)
- `GET /api/v1/professors/{professorId}` - Buscar professor por ID (UUID)
- `PUT /api/v1/professors/{professorId}` - Atualizar professor (completo)
- `DELETE /api/v1/professors/{professorId}` - Deletar professor

### Classes (Sub-recurso de Professores)
- `GET /api/v1/professors/{professorId}/classes` - Listar classes de um professor
- `POST /api/v1/professors/{professorId}/classes` - Associar professor a uma classe
- `DELETE /api/v1/professors/{professorId}/classes/{classId}` - Desassociar professor de uma classe

### Graduações (Sub-recurso de Professores)
- `POST /api/v1/professors/{professorId}/graduations/` - Criar graduação para um professor
- `GET /api/v1/professors/{professorId}/graduations/` - Listar graduações de um professor
- `PUT /api/v1/professors/{professorId}/graduations/{graduationId}` - Atualizar graduação
- `DELETE /api/v1/professors/{professorId}/graduations/{graduationId}` - Excluir graduação

### Graduações (Endpoint Geral)
- `GET /api/v1/graduations/` - Listar todas as graduações do sistema

### Health & Metrics
- `GET /api/v1/health` - Health check
- `GET /api/v1/metrics` - Métricas Prometheus

---

## 7. Reservations Service (NestJS - TypeScript)

**Base URL:** `http://reservations:8080` (interno) / `http://localhost:8186` (externo)

### Reservas
- `POST /api/v1/reservations` - Criar uma nova reserva
- `GET /api/v1/reservations` - Listar reservas (query: `reservation_id`, `initial_date`, `end_date`, `details`, `resource_id`, `lesson_id`, `deleted`)
- `GET /api/v1/reservations/{reservationId}` - Buscar reserva por ID
- `PUT /api/v1/reservations/{reservationId}` - Atualizar reserva (completo)
- `PATCH /api/v1/reservations/{reservationId}` - Atualizar reserva (parcial)
- `DELETE /api/v1/reservations/{reservationId}` - Remover reserva

### Usuários Autorizados (Sub-recurso de Reservas)
- `POST /api/v1/reservations/{reservationId}/authorized-users` - Adicionar usuário autorizado à reserva
- `GET /api/v1/reservations/{reservationId}/authorized-users` - Listar usuários autorizados de uma reserva
- `GET /api/v1/reservations/{reservationId}/authorized-users/{authorizedUserId}` - Buscar usuário autorizado específico
- `PUT /api/v1/reservations/{reservationId}/authorized-users/{authorizedUserId}` - Atualizar usuário autorizado (completo)
- `PATCH /api/v1/reservations/{reservationId}/authorized-users/{authorizedUserId}` - Atualizar usuário autorizado (parcial)
- `DELETE /api/v1/reservations/{reservationId}/authorized-users/{authorizedUserId}` - Remover usuário autorizado da reserva

### Health & Metrics
- `GET /api/v1/health` - Health check
- `GET /api/v1/metrics` - Métricas Prometheus

---

## 8. Resources Service (NestJS - TypeScript)

**Base URL:** `http://resources:3000` (interno) / `http://localhost:8187` (externo)

### Recursos
- `POST /api/v1/resources` - Criar um novo recurso
- `GET /api/v1/resources` - Listar todos os recursos (query: `categoryId`)
- `GET /api/v1/resources/{resourceId}` - Buscar recurso por ID
- `GET /api/v1/resources?categoryId={categoryId}` - Buscar recursos por categoria
- `PATCH /api/v1/resources/{resourceId}` - Atualizar recurso (parcial)
- `PUT /api/v1/resources/{resourceId}` - Substituir recurso (completo)
- `DELETE /api/v1/resources/{resourceId}` - Deletar recurso

### Categorias
- `POST /api/v1/categories` - Criar uma nova categoria
- `GET /api/v1/categories` - Listar todas as categorias
- `GET /api/v1/categories/{categoryId}` - Buscar categoria por ID
- `PATCH /api/v1/categories/{categoryId}` - Atualizar categoria (parcial)
- `PUT /api/v1/categories/{categoryId}` - Substituir categoria (completo)
- `DELETE /api/v1/categories/{categoryId}` - Deletar categoria

### Relacionamentos de Categorias
- `GET /api/v1/categories/{categoryId}/resources` - Listar recursos de uma categoria
- `POST /api/v1/categories/{categoryId}/resources` - Criar recurso em uma categoria
- `GET /api/v1/categories/{categoryId}/features` - Listar features de uma categoria
- `POST /api/v1/categories/{categoryId}/features` - Criar feature em uma categoria

### Features
- `POST /api/v1/features` - Criar uma nova feature
- `GET /api/v1/features` - Listar todas as features (query: `categoryId`)
- `GET /api/v1/features/{featureId}` - Buscar feature por ID
- `GET /api/v1/features/category/{categoryId}` - Buscar features por categoria
- `PATCH /api/v1/features/{featureId}` - Atualizar feature (parcial)
- `PUT /api/v1/features/{featureId}` - Substituir feature (completo)
- `DELETE /api/v1/features/{featureId}` - Deletar feature

### Feature Values
- `POST /api/v1/feature-values` - Criar um novo feature value
- `GET /api/v1/feature-values` - Listar todos os feature values
- `GET /api/v1/feature-values/{featureValueId}` - Buscar feature value por ID
- `GET /api/v1/feature-values/resource/{resourceId}` - Buscar feature values por recurso
- `GET /api/v1/feature-values/feature/{featureId}` - Buscar feature values por feature
- `PATCH /api/v1/feature-values/{featureValueId}` - Atualizar feature value (parcial)
- `DELETE /api/v1/feature-values/{featureValueId}` - Deletar feature value

### Feature Values (Recurso-específico)
- `POST /api/v1/feature-values/resources/{resourceId}/features` - Criar feature value para um recurso
- `GET /api/v1/feature-values/resources/{resourceId}/features` - Listar feature values de um recurso
- `GET /api/v1/feature-values/resources/{resourceId}/features/{featureValueId}` - Buscar feature value específico
- `PATCH /api/v1/feature-values/resources/{resourceId}/features/{featureValueId}` - Atualizar feature value
- `DELETE /api/v1/feature-values/resources/{resourceId}/features/{featureValueId}` - Deletar feature value

### Value Types
- `GET /api/v1/value-types` - Listar tipos de valores disponíveis (enum)

### Health & Metrics
- `GET /api/v1/health` - Health check
- `GET /api/v1/metrics` - Métricas Prometheus

---

## 9. Rooms Service (NestJS - TypeScript)

**Base URL:** `http://rooms:3000` (interno) / `http://localhost:8188` (externo)

### Salas
- `POST /api/v1/rooms` - Criar uma nova sala
- `GET /api/v1/rooms` - Listar salas (query: `page`, `limit`, `building`, `category`, `status`, `minCapacity`, `maxCapacity`, `number`)
- `GET /api/v1/rooms/{roomId}` - Buscar sala por ID
- `PUT /api/v1/rooms/{roomId}` - Substituir sala (completo)
- `PATCH /api/v1/rooms/{roomId}` - Atualizar sala (parcial)
- `DELETE /api/v1/rooms/{roomId}` - Deletar sala

### Mobílias (Sub-recurso de Salas) - Scaffold/Not Implemented
- `POST /api/v1/rooms/{roomId}/furnitures` - Criar mobília (scaffold - retorna 501)
- `GET /api/v1/rooms/{roomId}/furnitures` - Listar mobílias (scaffold - retorna 501)
- `GET /api/v1/rooms/{roomId}/furnitures/{furnitureId}` - Buscar mobília (scaffold - retorna 501)
- `PUT /api/v1/rooms/{roomId}/furnitures/{furnitureId}` - Substituir mobília (scaffold - retorna 501)
- `PATCH /api/v1/rooms/{roomId}/furnitures/{furnitureId}` - Atualizar mobília (scaffold - retorna 501)
- `DELETE /api/v1/rooms/{roomId}/furnitures/{furnitureId}` - Deletar mobília (scaffold - retorna 501)

### Health & Metrics
- `GET /api/v1/health` - Health check
- `GET /api/v1/metrics` - Métricas Prometheus

---

## 10. Students Service (.NET - C#)

**Base URL:** `http://students:8080` (interno) / `http://localhost:8189` (externo)

### Estudantes
- `POST /api/v1/students` - Criar um novo estudante
- `GET /api/v1/students` - Listar estudantes (query: `name`, `enrollment`, `email`)
- `GET /api/v1/students/{studentId}` - Buscar estudante por ID (UUID)
- `PUT /api/v1/students/{studentId}` - Atualizar estudante (completo)
- `PATCH /api/v1/students/{studentId}` - Atualizar estudante (parcial - JSON Patch)
- `DELETE /api/v1/students/{studentId}` - Deletar estudante

### Telefones (Sub-recurso de Estudantes)
- `POST /api/v1/students/{studentId}/phone-numbers` - Adicionar telefone a um estudante
- `GET /api/v1/students/{studentId}/phone-numbers` - Listar telefones de um estudante
- `GET /api/v1/students/{studentId}/phone-numbers/{phoneNumberId}` - Buscar telefone específico por ID
- `PUT /api/v1/students/{studentId}/phone-numbers/{phoneNumberId}` - Atualizar telefone (completo)
- `PATCH /api/v1/students/{studentId}/phone-numbers/{phoneNumberId}` - Atualizar telefone (parcial)
- `DELETE /api/v1/students/{studentId}/phone-numbers/{phoneNumberId}` - Deletar telefone

### Health & Metrics
- `GET /api/v1/health` - Health check
- `GET /api/v1/metrics` - Métricas Prometheus

---

## Resumo por Método HTTP

### GET (Leitura)
- Todos os serviços expõem endpoints GET para listar recursos e buscar por ID
- Muitos serviços suportam filtros via query parameters
- Sub-recursos geralmente seguem o padrão `/api/v1/{recurso}/{recursoId}/{sub-recurso}`

### POST (Criação)
- Todos os serviços expõem endpoints POST para criar recursos
- Sub-recursos podem ser criados via endpoints aninhados

### PUT (Substituição Completa)
- Maioria dos serviços expõe PUT para substituição completa de recursos
- Alguns serviços usam apenas PATCH

### PATCH (Atualização Parcial)
- Todos os serviços NestJS e .NET suportam PATCH
- FastAPI (Python) também suporta PATCH
- Spring Boot (Java) suporta PATCH via `@PatchMapping`

### DELETE (Exclusão)
- Todos os serviços expõem DELETE para remover recursos
- Alguns serviços fazem exclusão lógica (soft delete)

---

## Autenticação

**Todos os endpoints (exceto health e metrics) requerem autenticação via Bearer Token:**

```
Authorization: Bearer <token>
```

O token deve ser obtido via:
- `POST /api/v1/login` (OAuth Service)

---

## Observações Importantes

1. **Prefixos Globais:** Todos os serviços usam o prefixo `/api/v1` globalmente
2. **Health Checks:** Todos os serviços expõem `/api/v1/health`
3. **Metrics:** Todos os serviços expõem `/api/v1/metrics`
4. **IDs:** A maioria dos serviços usa UUIDs, exceto Courses que usa MongoDB ObjectId
5. **Paginação:** Alguns serviços suportam paginação via query parameters (`page`, `limit`, `size`)
6. **Filtros:** Muitos serviços suportam filtros avançados via query parameters
