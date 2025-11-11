# Lista de Endpoints - ConstrSW

Este documento lista todos os endpoints de todos os serviços do sistema ConstrSW.

## Índice
1. [OAuth](#oauth)
2. [Employees](#employees)
3. [Classes](#classes)
4. [Courses](#courses)
5. [Lessons](#lessons)
6. [Professors](#professors)
7. [Reservations](#reservations)
8. [Resources](#resources)
9. [Rooms](#rooms)
10. [Students](#students)

---

## OAuth

**Base URL:** `http://localhost:8180` (externo) / `http://oauth:8000` (interno)  
**Prefixo:** `/api/v1`

### Autenticação (auth)
- `POST /api/v1/login` - Autenticação de usuário
- `POST /api/v1/refresh` - Renovação de access token
- `POST /api/v1/validate` - Validação de access token

### Usuários (users)
- `POST /api/v1/users` - Criar um novo usuário
- `GET /api/v1/users` - Listar todos os usuários (filtro opcional: `enabled`)
- `GET /api/v1/users/{user_id}` - Buscar usuário por ID
- `GET /api/v1/users/{user_id}/roles` - Listar roles de um usuário
- `PUT /api/v1/users/{user_id}` - Atualizar usuário (completo)
- `PATCH /api/v1/users/{user_id}` - Atualizar senha de um usuário
- `DELETE /api/v1/users/{user_id}` - Desativar um usuário
- `POST /api/v1/users/{user_id}/roles` - Atribuir roles a um usuário
- `DELETE /api/v1/users/{user_id}/roles` - Remover roles de um usuário

### Roles
- `POST /api/v1/roles` - Criar um novo role
- `GET /api/v1/roles` - Listar todos os roles (filtro opcional: `enabled`)
- `GET /api/v1/roles/{role_id}` - Buscar role por ID
- `PUT /api/v1/roles/{role_id}` - Atualizar role (completo)
- `PATCH /api/v1/roles/{role_id}` - Atualizar role (parcial)
- `DELETE /api/v1/roles/{role_id}` - Excluir um role

### Health & Metrics
- `GET /health` - Health check
- `GET /metrics` - Métricas Prometheus

---

## Employees

**Base URL:** `http://localhost:8181` (externo) / `http://employees:8080` (interno)  
**Prefixo:** `/employees`

### Funcionários
- `POST /employees` - Criar funcionário
- `GET /employees` - Listar funcionários (query params: `page`, `limit`, `search`)
- `GET /employees/{id}` - Buscar funcionário por ID
- `PUT /employees/{id}` - Atualizar funcionário (completo)
- `PATCH /employees/{id}` - Atualizar funcionário (parcial)
- `DELETE /employees/{id}` - Deletar funcionário

### Tarefas (Tasks)
- `GET /employees/{id}/tasks` - Listar tarefas de um funcionário (query params: `page`, `limit`, `description`, `startDate`, `endDate`)
- `POST /employees/{id}/tasks` - Criar tarefa para um funcionário
- `GET /employees/{employeeId}/tasks/{taskId}` - Buscar tarefa específica
- `PUT /employees/{employeeId}/tasks/{taskId}` - Atualizar tarefa (completo)
- `PATCH /employees/{employeeId}/tasks/{taskId}` - Atualizar tarefa (parcial)
- `DELETE /employees/{employeeId}/tasks/{taskId}` - Deletar tarefa

---

## Classes

**Base URL:** `http://localhost:8182` (externo) / `http://classes:8080` (interno)  
**Prefixo:** `/api/v1/classes`

### Classes
- `POST /api/v1/classes` - Criar uma nova classe
- `GET /api/v1/classes` - Listar classes (query params: `year`, `semester`, `course_id`, `page`, `size`)
- `GET /api/v1/classes/{id}` - Obter classe por ID
- `PUT /api/v1/classes/{id}` - Atualizar classe (completo)
- `PATCH /api/v1/classes/{id}` - Atualização parcial da classe
- `DELETE /api/v1/classes/{id}` - Excluir classe

### Provas (Exams) - Sub-recurso de Classes
- `POST /api/v1/classes/{id}/exams` - Adicionar prova à classe
- `GET /api/v1/classes/{id}/exams` - Listar provas da classe
- `GET /api/v1/classes/{id}/exams/{examId}` - Obter prova por ID
- `PUT /api/v1/classes/{id}/exams/{examId}` - Atualizar prova (completo)
- `PATCH /api/v1/classes/{id}/exams/{examId}` - Atualização parcial da prova
- `DELETE /api/v1/classes/{id}/exams/{examId}` - Excluir prova

---

## Courses

**Base URL:** `http://localhost:8183` (externo) / `http://courses:8080` (interno)  
**Prefixo:** `/api/v1` (implícito no router)

### Cursos
- `POST /api/v1/courses` - Criar um novo curso
- `GET /api/v1/courses` - Listar cursos (query params: `name`, `modality`)
- `GET /api/v1/courses/{id}` - Buscar curso por ID
- `PUT /api/v1/courses/{id}` - Atualizar curso (completo)
- `PATCH /api/v1/courses/{id}` - Atualizar curso (parcial)
- `DELETE /api/v1/courses/{id}` - Deletar curso

### Materiais (Materials) - Sub-recurso de Cursos
- `POST /api/v1/courses/{id}/materials` - Adicionar material a um curso
- `GET /api/v1/courses/{id}/materials` - Listar materiais de um curso (query param: `name`)
- `GET /api/v1/courses/{id}/materials/{material_id}` - Buscar material específico
- `PUT /api/v1/courses/{id}/materials/{material_id}` - Atualizar material (completo)
- `PATCH /api/v1/courses/{id}/materials/{material_id}` - Atualizar material (parcial)
- `DELETE /api/v1/courses/{id}/materials/{material_id}` - Deletar material

### Turmas (Classes) - Sub-recurso de Cursos
- `GET /api/v1/courses/{id}/classes` - Buscar turmas de um curso (query params: `semester`, `year`)

### Health & Metrics
- `GET /health` - Health check
- `GET /metrics` - Métricas Prometheus
- `GET /` - Root endpoint

---

## Lessons

**Base URL:** `http://localhost:8184` (externo) / `http://lessons:3000` (interno)  
**Prefixo:** `/api/v1`

### Aulas (Lessons)
- `POST /api/v1/lessons` - Criar uma nova aula
- `GET /api/v1/lessons` - Listar todas as aulas
- `GET /api/v1/lessons/{id}` - Buscar aula por ID (UUID)
- `PUT /api/v1/lessons/{id}` - Atualizar aula (completo)
- `PATCH /api/v1/lessons/{id}` - Atualizar aula (parcial)
- `DELETE /api/v1/lessons/{id}` - Deletar aula

### Assuntos (Subjects) - Sub-recurso de Aulas
- `POST /api/v1/lessons/{lessonId}/subjects` - Criar assunto para uma aula
- `GET /api/v1/lessons/{lessonId}/subjects` - Listar assuntos de uma aula
- `GET /api/v1/lessons/{lessonId}/subjects/{subjectId}` - Buscar assunto específico
- `PUT /api/v1/lessons/{lessonId}/subjects/{subjectId}` - Atualizar assunto (completo)
- `PATCH /api/v1/lessons/{lessonId}/subjects/{subjectId}` - Atualizar assunto (parcial)
- `DELETE /api/v1/lessons/{lessonId}/subjects/{subjectId}` - Deletar assunto

---

## Professors

**Base URL:** `http://localhost:8185` (externo) / `http://professors:8082` (interno)  
**Prefixo:** `/api/v1`

### Professores
- `POST /api/v1/professors/` - Criar um novo professor
- `GET /api/v1/professors/` - Buscar professores (query params: `name`, `status`)
- `GET /api/v1/professors/{id}` - Buscar professor específico por ID (UUID)
- `PUT /api/v1/professors/{id}` - Atualizar professor (completo)
- `DELETE /api/v1/professors/{id}` - Deletar professor

### Classes - Sub-recurso de Professores
- `GET /api/v1/professors/{id}/classes/` - Listar classes de um professor
- `POST /api/v1/professors/{id}/classes/` - Associar professor a uma classe
- `DELETE /api/v1/professors/{id}/classes/{class_id}` - Desassociar professor de uma classe

### Graduações (Graduations) - Sub-recurso de Professores
- `POST /api/v1/professors/{professor_id}/graduations/` - Criar graduação para um professor
- `GET /api/v1/professors/{professor_id}/graduations/` - Listar graduações de um professor
- `PUT /api/v1/professors/{professor_id}/graduations/{graduation_id}` - Atualizar uma graduação
- `DELETE /api/v1/professors/{professor_id}/graduations/{graduation_id}` - Excluir uma graduação

### Graduações (Endpoint Geral)
- `GET /api/v1/graduations/` - Listar todas as graduações do sistema

### Health
- `GET /health` - Health check

---

## Reservations

**Base URL:** `http://localhost:8186` (externo) / `http://reservations:8080` (interno)  
**Prefixo:** `/api/v1`

### Reservas
- `POST /api/v1/reservation` - Criar uma nova reserva
- `GET /api/v1/reservation` - Listar reservas (query params: `reservation_id`, `initial_date`, `end_date`, `details`, `resource_id`, `lesson_id`, `deleted`)
- `GET /api/v1/reservation/{id}` - Buscar reserva por ID
- `PUT /api/v1/reservation/{id}` - Atualizar reserva (completo)
- `PATCH /api/v1/reservation/{id}` - Atualizar reserva (parcial)
- `DELETE /api/v1/reservation/{id}` - Remover reserva

### Usuários Autorizados (Authorized Users) - Sub-recurso de Reservas
- `POST /api/v1/reservations/{reservationId}/authorized-users` - Adicionar usuário autorizado à reserva
- `GET /api/v1/reservations/{reservationId}/authorized-users` - Listar usuários autorizados de uma reserva
- `GET /api/v1/reservations/{reservationId}/authorized-users/{id}` - Buscar usuário autorizado específico
- `PUT /api/v1/reservations/{reservationId}/authorized-users/{id}` - Atualizar usuário autorizado (completo)
- `PATCH /api/v1/reservations/{reservationId}/authorized-users/{id}` - Atualizar usuário autorizado (parcial)
- `DELETE /api/v1/reservations/{reservationId}/authorized-users/{id}` - Remover usuário autorizado da reserva

### Health
- `GET /health` - Health check

---

## Resources

**Base URL:** `http://localhost:8187` (externo) / `http://resources:3000` (interno)  
**Prefixo:** `/api/v1`

### Categorias (Categories)
- `POST /api/v1/categories` - Criar uma nova categoria
- `GET /api/v1/categories` - Listar todas as categorias
- `GET /api/v1/categories/{id}` - Buscar categoria por ID (UUID)
- `PATCH /api/v1/categories/{id}` - Atualizar categoria (parcial)
- `PUT /api/v1/categories/{id}` - Substituir categoria (completo)
- `DELETE /api/v1/categories/{id}` - Deletar categoria

### Recursos de uma Categoria
- `GET /api/v1/categories/{id}/resources` - Listar recursos de uma categoria
- `POST /api/v1/categories/{id}/resources` - Criar recurso em uma categoria

### Features de uma Categoria
- `GET /api/v1/categories/{id}/features` - Listar features de uma categoria
- `POST /api/v1/categories/{id}/features` - Criar feature em uma categoria

### Recursos (Resources)
- `POST /api/v1/resources` - Criar um novo recurso
- `GET /api/v1/resources` - Listar todos os recursos (query param: `categoryId`)
- `GET /api/v1/resources/{id}` - Buscar recurso por ID (UUID)
- `GET /api/v1/resources/category/{categoryId}` - Buscar recursos por categoria
- `PATCH /api/v1/resources/{id}` - Atualizar recurso (parcial)
- `PUT /api/v1/resources/{id}` - Substituir recurso (completo)
- `DELETE /api/v1/resources/{id}` - Deletar recurso

### Features
- `POST /api/v1/features` - Criar uma nova feature
- `GET /api/v1/features` - Listar todas as features (query param: `categoryId`)
- `GET /api/v1/features/{id}` - Buscar feature por ID (UUID)
- `GET /api/v1/features/category/{categoryId}` - Buscar features por categoria
- `PATCH /api/v1/features/{id}` - Atualizar feature (parcial)
- `PUT /api/v1/features/{id}` - Substituir feature (completo)
- `DELETE /api/v1/features/{id}` - Deletar feature

### Feature Values (Valores de Features)
- `POST /api/v1/feature-values` - Criar um novo feature value
- `GET /api/v1/feature-values` - Listar todos os feature values
- `GET /api/v1/feature-values/{id}` - Buscar feature value por ID (UUID)
- `GET /api/v1/feature-values/resource/{resourceId}` - Buscar feature values por recurso
- `GET /api/v1/feature-values/feature/{featureId}` - Buscar feature values por feature
- `PATCH /api/v1/feature-values/{id}` - Atualizar feature value (parcial)
- `DELETE /api/v1/feature-values/{id}` - Deletar feature value

### Feature Values (Recursos Escopados)
- `POST /api/v1/feature-values/resources/{resourceId}/features` - Criar feature value para um recurso
- `GET /api/v1/feature-values/resources/{resourceId}/features` - Listar feature values de um recurso
- `GET /api/v1/feature-values/resources/{resourceId}/features/{featureValueId}` - Buscar feature value específico
- `PATCH /api/v1/feature-values/resources/{resourceId}/features/{featureValueId}` - Atualizar feature value
- `DELETE /api/v1/feature-values/resources/{resourceId}/features/{featureValueId}` - Deletar feature value

### Value Types
- `GET /api/v1/value-types` - Listar tipos de valores disponíveis (enum)

---

## Rooms

**Base URL:** `http://localhost:8188` (externo) / `http://rooms:3000` (interno)  
**Prefixo:** `/api/v1`

### Salas (Rooms)
- `POST /api/v1/rooms` - Criar uma nova sala
- `GET /api/v1/rooms` - Listar salas (query params: `page`, `limit`, `building`, `category`, `status`, `minCapacity`, `maxCapacity`, `number`)
- `GET /api/v1/rooms/{id}` - Buscar sala por ID
- `PUT /api/v1/rooms/{id}` - Substituir sala (completo)
- `PATCH /api/v1/rooms/{id}` - Atualizar sala (parcial)
- `DELETE /api/v1/rooms/{id}` - Deletar sala

### Mobílias (Furnitures) - Sub-recurso de Salas
- `POST /api/v1/rooms/{roomId}/furnitures` - Criar mobília (scaffold - não implementado)
- `GET /api/v1/rooms/{roomId}/furnitures` - Listar mobílias (scaffold - não implementado)
- `GET /api/v1/rooms/{roomId}/furnitures/{furnitureId}` - Buscar mobília por ID (scaffold - não implementado)
- `PUT /api/v1/rooms/{roomId}/furnitures/{furnitureId}` - Substituir mobília (scaffold - não implementado)
- `PATCH /api/v1/rooms/{roomId}/furnitures/{furnitureId}` - Atualizar mobília (scaffold - não implementado)
- `DELETE /api/v1/rooms/{roomId}/furnitures/{furnitureId}` - Deletar mobília (scaffold - não implementado)

### Health
- `GET /health` - Health check

---

## Students

**Base URL:** `http://localhost:8189` (externo) / `http://students:8080` (interno)  
**Prefixo:** `/api/v1`

### Estudantes
- `POST /api/v1/students` - Criar um novo estudante
- `GET /api/v1/students` - Listar estudantes (query params: `name`, `enrollment`, `email`)
- `GET /api/v1/students/{id}` - Buscar estudante por ID (UUID)
- `PUT /api/v1/students/{id}` - Atualizar estudante (completo)
- `PATCH /api/v1/students/{id}` - Atualizar estudante (parcial - JSON Patch)
- `DELETE /api/v1/students/{id}` - Deletar estudante

---

## Notas Importantes

1. **Autenticação**: A maioria dos serviços requer autenticação via Bearer Token (JWT) obtido através do serviço OAuth.

2. **Health Checks**: Todos os serviços possuem endpoints `/health` para verificação de saúde.

3. **Swagger/OpenAPI**: Vários serviços possuem documentação Swagger disponível:
   - Resources: `/api`
   - Reservations: `/api`
   - Rooms: `/api/v1/docs`
   - Lessons: Verificar documentação do NestJS

4. **Prefixos**: A maioria dos serviços usa o prefixo `/api/v1`, exceto:
   - Employees: `/employees`
   - OAuth: `/api/v1` (mas alguns endpoints estão na raiz como `/health`)

5. **Portas Externas**: As portas externas (localhost) são diferentes das internas (Docker). Use as portas externas para acesso local.

6. **Endpoints Scaffold**: Alguns endpoints de Furnitures (Rooms) estão marcados como scaffold e retornam 501 (Not Implemented).

