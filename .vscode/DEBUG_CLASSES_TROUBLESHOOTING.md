# Troubleshooting - Debug Classes Service

## Erro: "Failed command 'configurationDone' : 0x80070057"

Este erro geralmente indica um problema na comunicação inicial entre o VS Code e o vsdbg.

### Soluções a tentar:

#### 1. Verificar se a extensão C# está atualizada
```bash
code --list-extensions | grep ms-dotnettools
```

Se não estiver instalada ou desatualizada:
```bash
code --install-extension ms-dotnettools.csharp
```

#### 2. Verificar se o vsdbg está acessível
```bash
docker exec classes ls -la /vsdbg/vsdbg
docker exec classes /vsdbg/vsdbg --help
```

#### 3. Verificar se o processo dotnet está rodando
```bash
docker exec classes ps aux | grep dotnet
```

#### 4. Tentar uma abordagem alternativa - Usar TCP diretamente

Se o pipeTransport não funcionar, podemos tentar usar TCP diretamente. Isso requer modificar o docker-compose para iniciar o vsdbg como servidor TCP.

#### 5. Verificar logs do VS Code

Ative o logging do debugger no launch.json:
```json
"logging": {
  "engineLogging": true,
  "moduleLoad": true
}
```

Isso mostrará mais detalhes sobre o que está acontecendo.

#### 6. Reinstalar o vsdbg no container

Se nada funcionar, tente reconstruir o container:
```bash
docker-compose build --no-cache classes
docker-compose up -d classes
```

#### 7. Verificar versão do .NET e vsdbg

Certifique-se de que o vsdbg é compatível com .NET 8:
```bash
docker exec classes dotnet --version
docker exec classes ls -la /vsdbg/
```

### Alternativa: Usar Visual Studio ou Rider

Se o VS Code continuar com problemas, considere usar:
- **Visual Studio** com Remote Debugger
- **JetBrains Rider** com remote debugging

### Última opção: Debug local

Se o debug remoto não funcionar, você pode:
1. Executar a aplicação localmente (fora do Docker)
2. Configurar o MongoDB localmente ou usar port forwarding
3. Depurar diretamente no ambiente local

