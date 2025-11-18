# Como Depurar o Serviço Classes (.NET)

## Pré-requisitos

### 1. Instalar a Extensão C# no VS Code

O tipo de debug `coreclr` requer a extensão C# do VS Code.

**Opção A - Via Interface:**
1. Abra a aba Extensions (Ctrl+Shift+X)
2. Procure por "C#"
3. Instale a extensão **"C#"** da Microsoft (ms-dotnettools.csharp)

**Opção B - Via Comando:**
```bash
code --install-extension ms-dotnettools.csharp
```

### 2. Recarregar o VS Code

Após instalar a extensão:
- Pressione `Ctrl+Shift+P`
- Digite "Reload Window" e pressione Enter

## Como Usar

1. **Certifique-se de que o container está rodando:**
   ```bash
   docker-compose ps classes
   ```

2. **No VS Code:**
   - Abra o painel de Debug (Ctrl+Shift+D)
   - Selecione "Debug Classes (Docker)"
   - Pressione F5 ou clique em "Iniciar Depuração"

3. **Selecione o processo:**
   - Quando solicitado, escolha o processo `dotnet` do container `classes`

4. **Coloque breakpoints:**
   - Coloque breakpoints no código C# em `backend/classes/ClasseMicroservice/src`
   - O debugger pausará nos breakpoints durante a execução

## Verificação

Se o debug não funcionar, verifique:

1. **Container está rodando:**
   ```bash
   docker ps | grep classes
   ```

2. **vsdbg está instalado:**
   ```bash
   docker exec classes ls -la /vsdbg
   ```

3. **Porta de debug está mapeada:**
   ```bash
   docker ps | grep classes
   # Deve mostrar: 0.0.0.0:8282->5005/tcp
   ```

4. **Extensão C# está instalada:**
   - Verifique na aba Extensions se "C#" está instalada

## Troubleshooting

### Erro: "Configured debug type 'coreclr' is not supported"
- **Solução:** Instale a extensão C# (ms-dotnettools.csharp)

### Erro: "Cannot attach to process"
- **Solução:** Certifique-se de que o container está rodando e o processo dotnet está ativo

### Debugger não conecta
- **Solução:** Verifique se `DOTNET_DBG_ENABLE=1` no arquivo `.env`

