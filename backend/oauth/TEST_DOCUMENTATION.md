# Documentação dos Testes - OAuth API

Este documento descreve a estrutura de testes implementada para a OAuth API, cobrindo todas as rotas especificadas no arquivo `routes.txt`.

## Estrutura dos Testes

### 1. Testes de Controller (`AuthControllerTest`)

**Localização:** `/src/test/java/com/grupo6/constrsw/controller/AuthControllerTest.java`

**Cobertura:**
- ✅ `GET /test` - Endpoint de teste da API
- ✅ `POST /login` - Autenticação com credenciais válidas (201)
- ✅ `POST /login` - Validação de campos obrigatórios (400)
- ✅ `POST /login` - Credenciais inválidas (401)
- ✅ `POST /login` - Erro na estrutura da chamada (400)

**Cenários Testados:**
- Autenticação bem-sucedida com retorno de token
- Validação de username e password obrigatórios
- Tratamento de credenciais inválidas
- Tratamento de erros de estrutura
- Formato de resposta JSON correto

### 2. Testes de Controller de Usuários (`UserControllerTest`)

**Localização:** `/src/test/java/com/grupo6/constrsw/controller/UserControllerTest.java`

**Cobertura das Rotas:**

#### POST /api/users (Criação de usuário)
- ✅ Criação bem-sucedida (201)
- ✅ Email inválido (400)
- ✅ Token inválido (401)
- ✅ Sem permissão (403)
- ✅ Username já existente (409)

#### GET /api/users (Listagem de usuários)
- ✅ Listagem bem-sucedida (200)
- ✅ Filtro por enabled (200)
- ✅ Token inválido (401)
- ✅ Sem permissão (403)

#### GET /api/users/{id} (Busca por ID)
- ✅ Usuário encontrado (200)
- ✅ Usuário não encontrado (404)
- ✅ Token inválido (401)
- ✅ Sem permissão (403)

#### PUT /api/users/{id} (Atualização de usuário)
- ✅ Atualização bem-sucedida (200)
- ✅ Usuário não encontrado (404)
- ✅ Token inválido (401)
- ✅ Sem permissão (403)

#### PATCH /api/users/{id} (Atualização de senha)
- ✅ Atualização bem-sucedida (200)
- ✅ Usuário não encontrado (404)
- ✅ Token inválido (401)
- ✅ Sem permissão (403)

#### DELETE /api/users/{id} (Exclusão lógica)
- ✅ Desabilitação bem-sucedida (204)
- ✅ Usuário não encontrado (404)
- ✅ Token inválido (401)
- ✅ Sem permissão (403)

### 3. Testes de Integração (`OAuthApiIntegrationTest`)

**Localização:** `/src/test/java/com/grupo6/constrsw/integration/OAuthApiIntegrationTest.java`

**Cenários Testados:**
- ✅ Cenário completo sem Keycloak disponível
- ✅ Validação de estrutura de requests com dados inválidos
- ✅ Validação de autorização com tokens inválidos
- ✅ Teste de Content-Type (application/json vs form-data)

### 4. Testes de DTOs (`DtoTest`)

**Localização:** `/src/test/java/com/grupo6/constrsw/dto/DtoTest.java`

**Classes Testadas:**
- ✅ `AuthRequest` - Serialização/deserialização
- ✅ `AuthResponse` - Estrutura de resposta de autenticação
- ✅ `UserRequest` - Mapeamento de campos com @JsonProperty
- ✅ `UserResponse` - Estrutura de resposta de usuário
- ✅ `PasswordUpdateRequest` - Estrutura para atualização de senha
- ✅ `ApiError` - Estrutura padrão de erros

### 5. Testes de Validação (`EmailValidationTest`)

**Localização:** `/src/test/java/com/grupo6/constrsw/util/EmailValidationTest.java`

**Validações Testadas:**
- ✅ Emails válidos segundo RFC 5322
- ✅ Emails inválidos (vários formatos)
- ✅ Casos especiais (null, vazio, com espaços)
- ✅ Caracteres especiais válidos
- ✅ Domínios longos e com números

### 6. Testes de Configuração (`ApplicationConfigurationTest`)

**Localização:** `/src/test/java/com/grupo6/constrsw/ApplicationConfigurationTest.java`

**Verificações:**
- ✅ Carregamento do contexto Spring Boot
- ✅ Configuração de propriedades de teste

## Códigos de Erro Testados

Conforme especificado no `routes.txt`, todos os códigos de erro são testados:

| Código | Descrição | Testado |
|--------|-----------|---------|
| OA-400 | Bad Request | ✅ |
| OA-401 | Unauthorized | ✅ |
| OA-403 | Forbidden | ✅ |
| OA-404 | Not Found | ✅ |
| OA-409 | Conflict | ✅ |
| OA-500 | Internal Server Error | ✅ |

## Executar os Testes

### Todos os Testes
```bash
./mvnw test
```

### Testes Específicos por Classe
```bash
# Testes de autenticação
./mvnw test -Dtest=AuthControllerTest

# Testes de usuários
./mvnw test -Dtest=UserControllerTest

# Testes de integração
./mvnw test -Dtest=OAuthApiIntegrationTest

# Testes de DTOs
./mvnw test -Dtest=DtoTest

# Testes de validação
./mvnw test -Dtest=EmailValidationTest
```

### Relatório de Cobertura
Para gerar relatório de cobertura de código, adicione o plugin JaCoCo ao `pom.xml`:

```xml
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.8</version>
    <executions>
        <execution>
            <goals>
                <goal>prepare-agent</goal>
            </goals>
        </execution>
        <execution>
            <id>report</id>
            <phase>test</phase>
            <goals>
                <goal>report</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

## Estrutura de Mocks

Os testes utilizam `@MockBean` para simular:
- `KeycloakService` - Serviço de integração com Keycloak
- `PermissionService` - Serviço de verificação de permissões

## Padrões de Teste Implementados

1. **Arrange-Act-Assert (AAA)** - Organização clara dos testes
2. **Mocking** - Isolamento de dependências externas
3. **Parametrized Tests** - Para validação de múltiplos casos
4. **Integration Tests** - Testes end-to-end da aplicação
5. **DisplayName** - Descrições claras dos cenários testados

## Observações Importantes

1. **Keycloak Dependency**: Os testes de integração assumem que o Keycloak pode não estar disponível
2. **Token Format**: Todos os testes utilizam o formato `Bearer {token}` para autorização
3. **Content-Type**: Login aceita `application/x-www-form-urlencoded`, outras operações usam `application/json`
4. **Error Format**: Todas as respostas de erro seguem o padrão especificado com `error_code`, `error_description`, `error_source`, e `error_stack`

## Próximos Passos

Para melhorar ainda mais a cobertura de testes:

1. Adicionar testes de performance
2. Implementar testes de segurança
3. Adicionar testes com Testcontainers para Keycloak real
4. Implementar testes de carga
5. Adicionar validação de schemas JSON
