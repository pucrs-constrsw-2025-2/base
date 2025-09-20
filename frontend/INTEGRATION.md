# Integração Frontend-Backend OAuth

Esta documentação descreve como foi implementada a integração entre o frontend React e o backend OAuth API.

## Estrutura Criada

### 📁 Services (`/src/services/`)

#### `authService.ts`
- **Login**: Autenticação com multipart/form-data
- **Token Management**: Armazenamento seguro de tokens
- **Auto-logout**: Quando token expira
- **Persistência**: Dados salvos no localStorage

#### `userService.ts`
- **CRUD completo** para usuários
- **Validação** de dados
- **Busca e filtros**
- **Gerenciamento** de status (ativo/inativo)

#### `roleService.ts`
- **CRUD completo** para roles
- **Atribuição** de roles para usuários
- **Validação** de dados de roles

### 📁 Types (`/src/types/`)

#### `auth.ts`
- Interfaces baseadas nas **DTOs do backend**
- Tipos do frontend (User, UserRole)
- Tipos para contexto de autenticação

### 📁 Utils (`/src/utils/`)

#### `apiClient.ts`
- **Cliente HTTP** baseado no Axios
- **Interceptors** automáticos para token
- **Gerenciamento** de erros (401 = logout automático)
- **Método especial** para form-data (login)

#### `useAuth.ts`
- **Hook personalizado** para autenticação
- **Estado reativo** do usuário
- **Métodos** de login/logout

## Como Usar

### 1. Login Real

O `LoginScreen` agora faz chamadas reais para o backend:

```tsx
// Antes (mock)
const handleLogin = (username: string, password: string) => {
  // Simulação local
};

// Agora (real)
const handleLogin = async (user: User) => {
  // Autenticação real via API OAuth
  await authService.login(username, password);
};
```

### 2. Gerenciamento de Usuários

A `TeachersScreen` foi transformada em uma tela completa de CRUD:

```tsx
// Listar usuários
const users = await userService.getUsers();

// Criar usuário
await userService.createUser({
  username: "admin@test.com",
  password: "senha123",
  firstName: "Admin",
  lastName: "Teste"
});

// Atualizar usuário
await userService.updateUser(userId, userData);

// Desabilitar usuário
await userService.deleteUser(userId);
```

### 3. Gerenciamento de Roles

```tsx
// Listar roles
const roles = await roleService.getRoles();

// Criar role
await roleService.createRole({
  name: "professor",
  description: "Professor do sistema"
});

// Atribuir role para usuário
await roleService.assignRoleToUser(userId, "professor");
```

## Funcionalidades Implementadas

### ✅ Autenticação
- [x] Login real com backend OAuth
- [x] Logout com limpeza de dados
- [x] Persistência de sessão
- [x] Auto-logout quando token expira
- [x] Loading states

### ✅ Gerenciamento de Usuários
- [x] Listar todos os usuários
- [x] Criar novo usuário
- [x] Editar usuário existente
- [x] Desabilitar usuário (soft delete)
- [x] Busca/filtro por nome
- [x] Validação de dados
- [x] Interface responsiva

### ✅ Gerenciamento de Roles
- [x] CRUD completo de roles
- [x] Atribuição de roles para usuários
- [x] Validação de dados

### ✅ Interceptors & Middleware
- [x] Token automático em requisições
- [x] Tratamento de erros 401
- [x] Loading e error states
- [x] Toast notifications

## Configuração

### Variáveis de Ambiente

Arquivo `.env`:
```bash
VITE_API_URL=http://localhost:8082
```

### Dependências Adicionadas

```json
{
  "axios": "^1.6.2",
  "@types/react": "^18.3.1",
  "@types/react-dom": "^18.3.1"
}
```

## Próximos Passos

### 🔄 Melhorias Sugeridas

1. **Context API**: Implementar React Context para estado global
2. **React Query**: Adicionar cache e sincronização de dados
3. **Refresh Token**: Implementar renovação automática de tokens
4. **Roles UI**: Criar tela específica para gerenciar roles
5. **Permissões**: Implementar sistema de permissões por role
6. **Validação Avançada**: Usar react-hook-form + zod
7. **Testes**: Adicionar testes unitários e e2e

### 🔧 Como Testar

1. **Iniciar o backend**:
   ```bash
   cd backend/oauth
   ./mvnw spring-boot:run
   ```

2. **Iniciar o frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Acessar**: http://localhost:5173

4. **Testar login** com usuários do Keycloak ou criar novos

## Estrutura de Arquivos Final

```
frontend/src/
├── components/
│   ├── LoginScreen.tsx        # ✅ Integrado com authService
│   ├── screens/
│   │   ├── TeachersScreen.tsx # ✅ CRUD completo de usuários
│   │   └── ...
├── services/                  # ✅ Nova pasta
│   ├── authService.ts         # ✅ Autenticação
│   ├── userService.ts         # ✅ Usuários
│   ├── roleService.ts         # ✅ Roles
│   └── index.ts
├── types/                     # ✅ Nova pasta
│   ├── auth.ts               # ✅ Tipos TypeScript
│   └── index.ts
├── utils/                     # ✅ Nova pasta
│   ├── apiClient.ts          # ✅ Cliente HTTP
│   └── useAuth.ts            # ✅ Hook de autenticação
└── App.tsx                    # ✅ Integrado com authService
```

## Observações Importantes

- **Token Storage**: Tokens são salvos no localStorage
- **Auto-logout**: Usuário é deslogado automaticamente quando token expira
- **Error Handling**: Todos os erros são tratados e mostrados via toast
- **Loading States**: Interfaces mostram loading durante operações
- **Validação**: Dados são validados antes de enviar para API
- **Responsividade**: Interface funciona em diferentes tamanhos de tela