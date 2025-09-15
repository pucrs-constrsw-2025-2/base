
  # Closed CRAS 2025-2 - Frontend

Sistema de Gestão de Recursos Computacionais desenvolvido com React, TypeScript e Tailwind CSS.

## 📋 Sobre o Projeto

O Closed CRAS é um sistema web para gerenciamento de recursos computacionais de uma universidade, permitindo o cadastro e controle de professores, estudantes, salas, disciplinas, turmas, aulas e reservas de recursos.

**Design Original**: [Figma - Closed CRAS 2025-2](https://www.figma.com/design/7cSYSqk3J62NAPpKWAOyti/Closed-CRAS-2025-2)

## 🚀 Tecnologias Utilizadas

- **React 18.3.1** - Biblioteca para interfaces de usuário
- **TypeScript** - Superset do JavaScript com tipagem estática
- **Vite** - Build tool moderna e rápida
- **Tailwind CSS** - Framework CSS utilitário
- **shadcn/ui** - Biblioteca de componentes baseada em Radix UI
- **Lucide React** - Ícones SVG otimizados
- **React Hook Form** - Gerenciamento de formulários
- **Sonner** - Sistema de notificações toast

## 📁 Estrutura do Projeto

```
frontend/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── ui/             # Componentes de UI base (shadcn/ui)
│   │   ├── screens/        # Telas/páginas da aplicação
│   │   ├── LoginScreen.tsx # Tela de login
│   │   └── MainLayout.tsx  # Layout principal da aplicação
│   ├── styles/             # Estilos globais
│   ├── guidelines/         # Documentação e guidelines
│   ├── App.tsx            # Componente raiz
│   └── main.tsx           # Ponto de entrada da aplicação
├── package.json           # Dependências e scripts
├── vite.config.ts        # Configuração do Vite
└── README.md             # Este arquivo
```

## 🛠️ Instalação e Execução

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn

### Instalação

```bash
# Instalar dependências
npm install

# ou com yarn
yarn install
```

### Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# ou com yarn
yarn dev
```

O servidor será iniciado em `http://localhost:3000`

### Build para Produção

```bash
# Gerar build de produção
npm run build

# ou com yarn
yarn build
```

## 🔐 Autenticação

O sistema implementa um sistema de autenticação simulado com diferentes tipos de usuários:

- **Administrador**: Acesso completo ao sistema
- **Coordenador**: Acesso a funcionalidades de coordenação
- **Professor**: Acesso a funcionalidades de ensino
- **Aluno**: Acesso limitado às funcionalidades

### Credenciais de Teste

Para testar diferentes perfis, use os seguintes padrões no login:

- `admin_*` - Perfil Administrador
- `coord_*` - Perfil Coordenador  
- `prof_*` - Perfil Professor
- `*` - Perfil Aluno (padrão)

**Exemplo**: `admin_teste`, `coord_silva`, `prof_santos`

## 📱 Funcionalidades

### ✅ Implementadas

- [x] Sistema de login com simulação de roles
- [x] Dashboard com estatísticas e atividades recentes
- [x] Layout responsivo com sidebar
- [x] Navegação entre telas
- [x] Sistema de notificações
- [x] Design system completo (shadcn/ui)

### 🚧 Em Desenvolvimento

- [ ] Cadastro de Professores
- [ ] Cadastro de Estudantes
- [ ] Cadastro de Prédios e Salas
- [ ] Cadastro de Disciplinas
- [ ] Cadastro de Turmas
- [ ] Cadastro de Aulas
- [ ] Cadastro de Recursos Computacionais
- [ ] Sistema de Reservas

## 🎨 Design System

O projeto utiliza o **shadcn/ui** como base para o design system, garantindo:

- Componentes acessíveis e bem testados
- Consistência visual
- Suporte a modo escuro
- Responsividade nativa
- Customização flexível

### Componentes Disponíveis

- Button, Input, Card, Badge
- Dialog, Sheet, Popover
- Table, Form, Select
- Avatar, Sidebar, Navigation
- E muitos outros...

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
VITE_API_URL=http://localhost:8080/api
VITE_KEYCLOAK_URL=http://localhost:8080/auth
VITE_KEYCLOAK_REALM=constrsw
VITE_KEYCLOAK_CLIENT_ID=constrsw-frontend
```

### Configuração do Vite

O projeto está configurado com:

- **Hot Module Replacement (HMR)** para desenvolvimento rápido
- **Aliases de importação** para caminhos mais limpos
- **Build otimizado** para produção
- **Suporte a TypeScript** nativo

## 📚 Documentação Adicional

- [Guia de Autenticação](./AUTHENTICATION.md) - Estratégias de autenticação com Keycloak
- [Guidelines](./src/guidelines/Guidelines.md) - Padrões de desenvolvimento
- [Atribuições](./src/Attributions.md) - Licenças e créditos

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📝 Scripts Disponíveis

```bash
npm run dev      # Inicia servidor de desenvolvimento
npm run build    # Gera build de produção
npm run preview  # Preview do build de produção
```

## 🐛 Problemas Conhecidos

- [ ] Autenticação ainda é simulada (precisa integração com Keycloak)
- [ ] Telas de cadastro não implementadas
- [ ] Falta validação de formulários
- [ ] Não há tratamento de erros global

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](../../LICENSE) para mais detalhes.

## 👥 Equipe

Desenvolvido para a disciplina de Construção de Software - PUCRS 2025-2.

---

**Última atualização**: Janeiro 2025
  