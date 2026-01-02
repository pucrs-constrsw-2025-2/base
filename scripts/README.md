# Scripts de Automação

Este diretório contém scripts auxiliares para facilitar o desenvolvimento e CI/CD.

## Scripts Disponíveis

### SonarQube

#### `start-ngrok-sonar.ps1`

Inicia um túnel ngrok para expor o SonarQube local ao GitHub Actions.

**Uso:**
```powershell
.\scripts\start-ngrok-sonar.ps1
```

**O que faz:**
- Verifica se ngrok está instalado
- Verifica se SonarQube está rodando
- Inicia túnel ngrok na porta 9000
- Exibe a URL pública gerada
- Mantém o túnel ativo até você pressionar Ctrl+C

**Pré-requisitos:**
- ngrok instalado e configurado (com authtoken)
- SonarQube rodando em `http://localhost:9000`

**Exemplo de saída:**
```
========================================
  TÚNEL NGROK ATIVO!
========================================

URL pública: https://abc123.ngrok.io

PRÓXIMOS PASSOS:
1. Copie a URL acima
2. Vá em: GitHub → Settings → Secrets → Actions
3. Atualize ou crie o secret 'SONAR_HOST_URL' com: https://abc123.ngrok.io
```

#### `stop-ngrok-sonar.ps1`

Encerra o túnel ngrok do SonarQube.

**Uso:**
```powershell
.\scripts\stop-ngrok-sonar.ps1
```

---

## Instalação do ngrok

### Windows

**Opção 1: Chocolatey**
```powershell
choco install ngrok
```

**Opção 2: Download Manual**
1. Baixe de: https://ngrok.com/download
2. Extraia o executável
3. Adicione ao PATH ou coloque na pasta do projeto

### Linux/Mac

**Mac (Homebrew):**
```bash
brew install ngrok
```

**Linux (snap):**
```bash
snap install ngrok
```

## Configuração Inicial do ngrok

1. **Criar conta gratuita**: https://dashboard.ngrok.com/signup

2. **Obter authtoken**: https://dashboard.ngrok.com/get-started/your-authtoken

3. **Configurar authtoken**:
   ```bash
   ngrok config add-authtoken SEU_TOKEN_AQUI
   ```

4. **Testar**:
   ```bash
   ngrok http 9000
   ```

## Uso Completo

1. **Iniciar SonarQube**:
   ```powershell
   docker compose up -d sonarqube
   ```

2. **Aguardar SonarQube estar pronto** (cerca de 1-2 minutos)

3. **Iniciar túnel ngrok**:
   ```powershell
   .\scripts\start-ngrok-sonar.ps1
   ```

4. **Copiar a URL pública** exibida

5. **Configurar secret no GitHub**:
   - Vá em: `https://github.com/<seu-usuario>/<seu-repo>/settings/secrets/actions`
   - Adicione/atualize: `SONAR_HOST_URL` = URL do ngrok

6. **Fazer push e testar**:
   ```bash
   git add .
   git commit -m "test: sonarqube workflow"
   git push
   ```

7. **Verificar workflow**:
   - Vá em: **Actions** no GitHub
   - Veja o workflow "SonarQube Analysis" executando

## Notas

- **URLs temporárias**: URLs do ngrok mudam a cada reinício (exceto com plano pago)
- **Atualizar secret**: Sempre que reiniciar o ngrok, atualize o secret `SONAR_HOST_URL` no GitHub
- **Segurança**: Nunca commite tokens ou URLs. Use sempre secrets do GitHub.
