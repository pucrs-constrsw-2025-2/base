# Frontend Angular com Angular Material

Este diretório contém o frontend da aplicação ConstrSW desenvolvido em Angular com Angular Material.

## 🚀 Tecnologias Utilizadas

- **Angular** 17+ (versão LTS mais recente)
- **Angular Material** para componentes de UI
- **TypeScript** para tipagem estática
- **SCSS/Sass** para estilização
- **RxJS** para programação reativa
- **Angular CLI** para desenvolvimento e build

## 📋 Pré-requisitos

- Node.js 18+ LTS
- npm 9+ ou yarn 1.22+
- Angular CLI global: `npm install -g @angular/cli`

## 🛠️ Configuração Inicial

### 1. Instalação de Dependências

```bash
# Navegar para o diretório frontend
cd frontend

# Instalar dependências
npm install

# Ou usando yarn
yarn install
```

### 2. Instalação do Angular Material

```bash
ng add @angular/material
```

Durante a instalação, selecione:
- **Theme**: Indigo/Pink (ou outro de sua preferência)
- **Typography**: Yes
- **Animations**: Yes

## 🏗️ Estrutura do Projeto

```
frontend/
├── src/
│   ├── app/
│   │   ├── components/          # Componentes reutilizáveis
│   │   ├── pages/              # Páginas/views da aplicação
│   │   ├── services/           # Serviços e lógica de negócio
│   │   ├── models/             # Interfaces e tipos TypeScript
│   │   ├── guards/             # Guards de rota
│   │   ├── interceptors/       # Interceptors HTTP
│   │   └── shared/             # Componentes e utilitários compartilhados
│   ├── assets/                 # Recursos estáticos
│   ├── environments/           # Configurações por ambiente
│   └── styles/                 # Estilos globais e variáveis
├── angular.json                # Configuração do Angular
├── package.json                # Dependências do projeto
└── tsconfig.json              # Configuração do TypeScript
```

## 🎨 Melhores Práticas com Angular Material

### 1. Organização de Componentes

#### Estrutura de um Componente

```typescript
// component-name.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-component-name',
  templateUrl: './component-name.component.html',
  styleUrls: ['./component-name.component.scss']
})
export class ComponentNameComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {
    // Inicialização do componente
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

#### Template HTML com Material

```html
<!-- component-name.component.html -->
<mat-card class="component-card">
  <mat-card-header>
    <mat-card-title>Título do Card</mat-card-title>
    <mat-card-subtitle>Subtítulo</mat-card-subtitle>
  </mat-card-header>
  
  <mat-card-content>
    <mat-form-field appearance="outline" class="full-width">
      <mat-label>Campo de entrada</mat-label>
      <input matInput placeholder="Digite algo...">
      <mat-error *ngIf="formControl.hasError('required')">
        Campo obrigatório
      </mat-error>
    </mat-form-field>
  </mat-card-content>
  
  <mat-card-actions align="end">
    <button mat-button mat-dialog-close>Cancelar</button>
    <button mat-raised-button color="primary">Salvar</button>
  </mat-card-actions>
</mat-card>
```

### 2. Formulários Reativos

#### Configuração do Formulário

```typescript
// form.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html'
})
export class FormComponent implements OnInit {
  form: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', Validators.required],
      ativo: [true]
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      console.log(this.form.value);
    }
  }
}
```

#### Template do Formulário

```html
<!-- form.component.html -->
<form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-container">
  <div class="form-row">
    <mat-form-field appearance="outline" class="full-width">
      <mat-label>Nome</mat-label>
      <input matInput formControlName="nome" placeholder="Digite seu nome">
      <mat-error *ngIf="form.get('nome')?.hasError('required')">
        Nome é obrigatório
      </mat-error>
      <mat-error *ngIf="form.get('nome')?.hasError('minlength')">
        Nome deve ter pelo menos 3 caracteres
      </mat-error>
    </mat-form-field>
  </div>

  <div class="form-row">
    <mat-form-field appearance="outline" class="full-width">
      <mat-label>Email</mat-label>
      <input matInput formControlName="email" placeholder="Digite seu email">
      <mat-error *ngIf="form.get('email')?.hasError('required')">
        Email é obrigatório
      </mat-error>
      <mat-error *ngIf="form.get('email')?.hasError('email')">
        Email inválido
      </mat-error>
    </mat-form-field>
  </div>

  <div class="form-row">
    <mat-form-field appearance="outline" class="full-width">
      <mat-label>Telefone</mat-label>
      <input matInput formControlName="telefone" placeholder="Digite seu telefone">
      <mat-error *ngIf="form.get('telefone')?.hasError('required')">
        Telefone é obrigatório
      </mat-error>
    </mat-form-field>
  </div>

  <div class="form-row">
    <mat-checkbox formControlName="ativo">
      Ativo
    </mat-checkbox>
  </div>

  <div class="form-actions">
    <button mat-button type="button">Cancelar</button>
    <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
      Salvar
    </button>
  </div>
</form>
```

### 3. Tabelas com Material

#### Componente de Tabela

```typescript
// table.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';

export interface User {
  id: number;
  nome: string;
  email: string;
  ativo: boolean;
}

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html'
})
export class TableComponent implements OnInit {
  displayedColumns: string[] = ['id', 'nome', 'email', 'ativo', 'acoes'];
  dataSource: MatTableDataSource<User>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    const users: User[] = [
      { id: 1, nome: 'João Silva', email: 'joao@email.com', ativo: true },
      { id: 2, nome: 'Maria Santos', email: 'maria@email.com', ativo: false }
    ];
    
    this.dataSource = new MatTableDataSource(users);
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
```

#### Template da Tabela

```html
<!-- table.component.html -->
<div class="table-container">
  <mat-form-field appearance="outline" class="filter-field">
    <mat-label>Filtrar</mat-label>
    <input matInput (keyup)="applyFilter($event)" placeholder="Ex. João" #input>
  </mat-form-field>

  <table mat-table [dataSource]="dataSource" matSort class="mat-elevation-z8">
    <!-- Coluna ID -->
    <ng-container matColumnDef="id">
      <th mat-header-cell *matHeaderCellDef mat-sort-header> ID </th>
      <td mat-cell *matCellDef="let user"> {{user.id}} </td>
    </ng-container>

    <!-- Coluna Nome -->
    <ng-container matColumnDef="nome">
      <th mat-header-cell *matHeaderCellDef mat-sort-header> Nome </th>
      <td mat-cell *matCellDef="let user"> {{user.nome}} </td>
    </ng-container>

    <!-- Coluna Email -->
    <ng-container matColumnDef="email">
      <th mat-header-cell *matHeaderCellDef mat-sort-header> Email </th>
      <td mat-cell *matCellDef="let user"> {{user.email}} </td>
    </ng-container>

    <!-- Coluna Ativo -->
    <ng-container matColumnDef="ativo">
      <th mat-header-cell *matHeaderCellDef> Ativo </th>
      <td mat-cell *matCellDef="let user">
        <mat-chip [color]="user.ativo ? 'accent' : 'warn'" selected>
          {{user.ativo ? 'Sim' : 'Não'}}
        </mat-chip>
      </td>
    </ng-container>

    <!-- Coluna Ações -->
    <ng-container matColumnDef="acoes">
      <th mat-header-cell *matHeaderCellDef> Ações </th>
      <td mat-cell *matCellDef="let user">
        <button mat-icon-button color="primary" (click)="editar(user)">
          <mat-icon>edit</mat-icon>
        </button>
        <button mat-icon-button color="warn" (click)="excluir(user)">
          <mat-icon>delete</mat-icon>
        </button>
      </td>
    </ng-container>

    <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
    <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
  </table>

  <mat-paginator [pageSizeOptions]="[5, 10, 25, 100]" aria-label="Selecione a página"></mat-paginator>
</div>
```

### 4. Diálogos e Modais

#### Serviço de Diálogo

```typescript
// dialog.service.ts
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from './confirm-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  constructor(private dialog: MatDialog) {}

  confirm(message: string, title: string = 'Confirmar'): Promise<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: { title, message }
    });

    return dialogRef.afterClosed().toPromise();
  }
}
```

#### Componente de Confirmação

```typescript
// confirm-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmDialogData {
  title: string;
  message: string;
}

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html'
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
```

#### Template do Diálogo

```html
<!-- confirm-dialog.component.html -->
<h2 mat-dialog-title>{{data.title}}</h2>
<mat-dialog-content>
  <p>{{data.message}}</p>
</mat-dialog-content>
<mat-dialog-actions align="end">
  <button mat-button (click)="onCancel()">Cancelar</button>
  <button mat-raised-button color="warn" (click)="onConfirm()">Confirmar</button>
</mat-dialog-actions>
```

### 5. Estilização e Temas

#### Variáveis SCSS Globais

```scss
// styles/_variables.scss
// Cores do tema
$primary-color: #3f51b5;
$accent-color: #ff4081;
$warn-color: #f44336;

// Espaçamentos
$spacing-xs: 8px;
$spacing-sm: 16px;
$spacing-md: 24px;
$spacing-lg: 32px;
$spacing-xl: 48px;

// Breakpoints
$breakpoint-sm: 600px;
$breakpoint-md: 960px;
$breakpoint-lg: 1280px;
$breakpoint-xl: 1920px;

// Sombras
$shadow-1: 0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12);
$shadow-2: 0 3px 1px -2px rgba(0,0,0,.2), 0 2px 2px 0 rgba(0,0,0,.14), 0 1px 5px 0 rgba(0,0,0,.12);
```

#### Mixins Úteis

```scss
// styles/_mixins.scss
@mixin responsive($breakpoint) {
  @if $breakpoint == sm {
    @media (min-width: $breakpoint-sm) { @content; }
  } @else if $breakpoint == md {
    @media (min-width: $breakpoint-md) { @content; }
  } @else if $breakpoint == lg {
    @media (min-width: $breakpoint-lg) { @content; }
  } @else if $breakpoint == xl {
    @media (min-width: $breakpoint-xl) { @content; }
  }
}

@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin card-elevation {
  box-shadow: $shadow-1;
  transition: box-shadow 0.3s ease;
  
  &:hover {
    box-shadow: $shadow-2;
  }
}
```

#### Estilos de Componentes

```scss
// component-name.component.scss
@import 'src/styles/variables';
@import 'src/styles/mixins';

.component-card {
  @include card-elevation;
  margin: $spacing-md;
  padding: $spacing-md;
  
  @include responsive(md) {
    margin: $spacing-lg;
    padding: $spacing-lg;
  }
}

.form-container {
  max-width: 600px;
  margin: 0 auto;
  padding: $spacing-md;
}

.form-row {
  margin-bottom: $spacing-md;
}

.full-width {
  width: 100%;
}

.form-actions {
  @include flex-center;
  gap: $spacing-sm;
  margin-top: $spacing-lg;
}

.table-container {
  margin: $spacing-md;
  
  .filter-field {
    width: 100%;
    margin-bottom: $spacing-md;
  }
}
```

## 🔧 Configurações Importantes

### 1. angular.json

```json
{
  "projects": {
    "constrsw-frontend": {
      "architect": {
        "build": {
          "options": {
            "styles": [
              "@angular/material/prebuilt-themes/indigo-pink.css",
              "src/styles.scss"
            ],
            "stylePreprocessorOptions": {
              "includePaths": ["src/styles"]
            }
          }
        }
      }
    }
  }
}
```

### 2. tsconfig.json

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "sourceMap": true,
    "declaration": false,
    "moduleResolution": "node",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "importHelpers": true,
    "target": "ES2022",
    "module": "ES2022",
    "lib": ["ES2022", "dom"]
  }
}
```

## 🚀 Comandos de Desenvolvimento

### Desenvolvimento Local

```bash
# Servidor de desenvolvimento
ng serve

# Build de desenvolvimento
ng build

# Build de produção
ng build --configuration production

# Testes unitários
ng test

# Testes e2e
ng e2e

# Linting
ng lint
```

### Geração de Componentes

```bash
# Gerar componente
ng generate component components/nome-componente

# Gerar serviço
ng generate service services/nome-servico

# Gerar guard
ng generate guard guards/nome-guard

# Gerar interceptor
ng generate interceptor interceptors/nome-interceptor
```

## 📱 Responsividade

### Breakpoints do Angular Material

```scss
// Utilizar breakpoints do Material
@use '@angular/material' as mat;

@include mat.core();

$my-primary: mat.define-palette(mat.$indigo-palette);
$my-accent: mat.define-palette(mat.$pink-palette, A200, A100, A400);

$my-theme: mat.define-light-theme((
 color: (
   primary: $my-primary,
   accent: $my-accent,
 ),
 typography: mat.define-typography-config(),
 density: 0,
));

@include mat.all-component-themes($my-theme);
```

### Classes Utilitárias

```scss
// styles/_utilities.scss
.hidden-xs {
  @include responsive(sm) {
    display: none;
  }
}

.hidden-sm {
  @include responsive(md) {
    display: none;
  }
}

.text-center-xs {
  text-align: center;
  
  @include responsive(md) {
    text-align: left;
  }
}
```

## 🧪 Testes

### Testes de Componentes

```typescript
// component-name.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';

import { ComponentNameComponent } from './component-name.component';

describe('ComponentNameComponent', () => {
  let component: ComponentNameComponent;
  let fixture: ComponentFixture<ComponentNameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComponentNameComponent ],
      imports: [
        NoopAnimationsModule,
        MatDialogModule,
        ReactiveFormsModule
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ComponentNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

## 📚 Recursos Adicionais

### Documentação Oficial
- [Angular Material](https://material.angular.io/)
- [Angular](https://angular.io/)
- [Angular CLI](https://cli.angular.io/)

### Bibliotecas Recomendadas
- **@angular/flex-layout** - Para layouts responsivos
- **@angular/cdk** - Componentes de baixo nível
- **ngx-toastr** - Para notificações
- **ngx-loading** - Para indicadores de carregamento

### Padrões de Código
- [Angular Style Guide](https://angular.io/guide/styleguide)
- [Material Design Guidelines](https://material.io/design)

## 🤝 Contribuição

1. Siga os padrões de código estabelecidos
2. Escreva testes para novos componentes
3. Documente APIs e componentes complexos
4. Use commits semânticos
5. Mantenha a responsividade em mente

## 📝 Notas de Versão

- **v1.0.0** - Estrutura inicial com Angular Material
- **v1.1.0** - Adicionados componentes de tabela e formulários
- **v1.2.0** - Implementados diálogos e modais
- **v1.3.0** - Melhorias de responsividade e temas

---

**Desenvolvido com ❤️ pela equipe ConstrSW**
