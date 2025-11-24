# Módulo Resources - Frontend

Este módulo contém toda a interface de gerenciamento de Recursos Computacionais do sistema Closed CRAS.

## 📁 Estrutura de Pastas

```
frontend/src/components/resources/
├── dialogs/              # Modais de criação/edição
│   ├── CategoryDialog.tsx
│   ├── ResourceDialog.tsx
│   ├── FeatureDialog.tsx
│   ├── FeatureValueDialog.tsx
│   └── DeleteConfirmDialog.tsx
├── forms/                # Formulários reutilizáveis
│   ├── CategoryForm.tsx
│   ├── ResourceForm.tsx
│   ├── FeatureForm.tsx
│   └── FeatureValueForm.tsx
├── tabs/                 # Abas principais da tela
│   ├── CategoriesTab.tsx
│   ├── ResourcesTab.tsx
│   ├── FeaturesTab.tsx
│   └── OverviewTab.tsx
├── views/                # Componentes de visualização
│   ├── CategoryCard.tsx
│   ├── ResourceCard.tsx
│   ├── FeatureValueBadge.tsx
│   └── ResourceDetailView.tsx
├── index.ts              # Exportações centralizadas
└── README.md             # Este arquivo
```

## 🎯 Funcionalidades Implementadas

### 1. Gerenciamento de Categorias
- ✅ Listagem em grid com cards
- ✅ Busca por nome
- ✅ Criação via dialog
- ✅ Edição inline
- ✅ Exclusão com confirmação
- ✅ Visualização de recursos/features por categoria

### 2. Gerenciamento de Recursos
- ✅ Listagem em grid com cards
- ✅ Filtro por categoria
- ✅ Busca por nome
- ✅ Criação com seleção de categoria e status
- ✅ Edição completa
- ✅ Exclusão com confirmação
- ✅ Badges de status visuais
- ✅ Link para visualização detalhada

### 3. Gerenciamento de Features
- ✅ Listagem em tabela
- ✅ Filtro por categoria
- ✅ Busca por nome
- ✅ Criação com seleção de tipo de valor
- ✅ Edição
- ✅ Exclusão
- ✅ Badges de tipo de valor

### 4. Overview
- ✅ Cards de estatísticas
- ✅ Distribuição por status
- ✅ Recursos recentes
- ✅ Indicadores visuais

### 5. Visualização Detalhada de Recurso
- ✅ Informações completas
- ✅ Gerenciamento de feature values
- ✅ Adicionar/editar/remover características

## 🎨 Componentes UI Utilizados

- **Card** - Containers principais
- **Button** - Ações e CTAs
- **Input** - Campos de texto
- **Textarea** - Descrições
- **Select** - Dropdowns de seleção
- **Switch** - Valores booleanos
- **Dialog** - Modais de criação/edição
- **AlertDialog** - Confirmações de exclusão
- **Table** - Listagem de features
- **Tabs** - Navegação entre seções
- **Badge** - Status e tags
- **Separator** - Divisores
- **Skeleton** - Loading states (a implementar)
- **Sonner (Toast)** - Notificações

## 🔄 Fluxos de Dados

### Criação de Categoria
1. Usuário clica em "Nova Categoria"
2. Dialog abre com formulário
3. Usuário preenche nome e descrição
4. Formulário valida dados
5. Callback `onSubmit` é chamado
6. Toast de sucesso é exibido
7. Lista é atualizada

### Criação de Recurso
1. Usuário clica em "Novo Recurso"
2. Dialog abre com formulário
3. Usuário seleciona categoria e status
4. Usuário preenche nome e descrição
5. Formulário valida dados
6. Callback `onSubmit` é chamado
7. Toast de sucesso é exibido
8. Lista é atualizada

### Adição de Feature Value
1. Usuário visualiza detalhes de um recurso
2. Clica em "Adicionar Característica"
3. Dialog abre com seleção de feature
4. Tipo de input muda conforme valueType da feature
5. Usuário preenche o valor
6. Callback `onSubmit` é chamado
7. Lista de características é atualizada

## 🔐 Validações Implementadas

### CategoryForm
- Nome: obrigatório, mínimo 3 caracteres
- Descrição: opcional

### ResourceForm
- Nome: obrigatório, mínimo 3 caracteres
- Categoria: obrigatória (select)
- Status: obrigatório (select)
- Descrição: opcional

### FeatureForm
- Nome: obrigatório, mínimo 2 caracteres
- Categoria: obrigatória (select)
- Tipo de Valor: obrigatório (select)
- Descrição: opcional

### FeatureValueForm
- Feature: obrigatória (select)
- Valor: obrigatório, validado conforme tipo
  - `number`: valida se é numérico
  - `string`: valida se não está vazio
  - `boolean`: switch (sempre válido)
  - `date`: input type="date"

## 📊 Estados de Loading

Todos os formulários e ações de exclusão possuem estados de loading:
- Botões mostram "Salvando..." ou "Excluindo..."
- Inputs ficam desabilitados durante operação
- Previne múltiplos submits

## 🚀 Próximos Passos (Integração com API)

### A implementar:
1. **Serviços HTTP** - Criar camada de integração com API
2. **Gerenciamento de Estado** - Context API ou Zustand
3. **React Query** - Cache e sincronização de dados
4. **Error Handling** - Tratamento robusto de erros da API
5. **Loading States** - Skeleton components durante fetch
6. **Paginação** - Para listas grandes
7. **Autenticação** - Integração com OAuth/Keycloak
8. **Autorização** - Controle de ações por role

### Endpoints a integrar:
- ✅ Categories: 8 endpoints
- ✅ Resources: 7 endpoints
- ✅ Features: 9 endpoints
- ✅ Feature Values: 12 endpoints
- ✅ Value Types: 1 endpoint

## 💡 Padrões de Código

### Nomenclatura
- Componentes: PascalCase (ex: `CategoryCard.tsx`)
- Funções: camelCase (ex: `handleSubmit`)
- Interfaces: PascalCase com sufixo Props (ex: `CategoryFormProps`)
- Tipos: PascalCase (ex: `ValueType`)

### Organização
- Um componente por arquivo
- Exports nomeados (não default)
- Props tipadas com TypeScript
- Comentários TODO para integrações futuras

### Estilização
- TailwindCSS classes
- Componentes shadcn/ui
- Consistência com resto do frontend
- Responsividade mobile-first

## 🧪 Testabilidade

Todos os componentes foram desenvolvidos para facilitar testes:
- Props bem definidas
- Callbacks para ações
- Estado local isolado
- Sem dependências diretas de API

## 📝 Notas Importantes

1. **Dados Mock**: Todos os dados são mock. Na integração, substituir por chamadas à API.
2. **IDs**: UUIDs serão gerados pelo backend. Mock usa timestamps.
3. **Validações**: Cliente-side apenas. Backend deve validar novamente.
4. **Toasts**: Usar `sonner` importado de `./ui/sonner`
5. **Isolamento**: Todo código está na pasta `resources/` para evitar conflitos

## 🤝 Como Usar

### Importar componente individual:
```tsx
import { CategoryDialog } from '@/components/resources/dialogs/CategoryDialog';
```

### Importar múltiplos componentes:
```tsx
import { 
  CategoryDialog, 
  ResourceDialog, 
  FeatureDialog 
} from '@/components/resources';
```

### Usar na tela principal:
```tsx
import { ResourcesScreen } from '@/components/screens/ResourcesScreen';

// Em App.tsx ou Router
<ResourcesScreen />
```

---

**Desenvolvido para**: Closed CRAS 2025-2  
**Última atualização**: Novembro 2025
