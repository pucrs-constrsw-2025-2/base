# Configuração do SonarQube para GitHub Actions

Este guia explica como expor o SonarQube local para que o GitHub Actions possa acessá-lo.

## Opções Disponíveis

### Opção 1: ngrok (Recomendado para Desenvolvimento/Teste)

O **ngrok** cria um túnel HTTPS público temporário para o seu SonarQube local.

#### Instalação do ngrok

1. **Windows (via Chocolatey)**:
   ```powershell
   choco install ngrok
   ```

2. **Windows (Download manual)**:
   - Baixe de: https://ngrok.com/download
   - Extraia e adicione ao PATH

3. **Linux/Mac**:
   ```bash
   # Via Homebrew (Mac)
   brew install ngrok
   
   # Via snap (Linux)
   snap install ngrok
   ```

#### Configuração

1. **Criar conta no ngrok** (gratuita): https://dashboard.ngrok.com/signup

2. **Obter authtoken**:
   - Acesse: https://dashboard.ngrok.com/get-started/your-authtoken
   - Execute:
     ```bash
     ngrok config add-authtoken SEU_TOKEN_AQUI
     ```

3. **Iniciar túnel**:
   ```powershell
   # No diretório raiz do projeto
   .\scripts\start-ngrok-sonar.ps1
   ```
   
   Ou manualmente:
   ```bash
   ngrok http 9000
   ```

4. **Copiar a URL HTTPS** gerada (ex: `https://abc123.ngrok.io`)

5. **Atualizar secret no GitHub**:
   - Vá em: **Settings → Secrets and variables → Actions**
   - Atualize `SONAR_HOST_URL` com a URL do ngrok (ex: `https://abc123.ngrok.io`)

#### Script Automatizado

Use o script `scripts/start-ngrok-sonar.ps1` que:
- Verifica se o ngrok está instalado
- Inicia o túnel
- Exibe a URL para copiar
- Mantém o túnel ativo

---

### Opção 2: Deploy em Servidor Público (Recomendado para Produção)

Para um ambiente de produção, você deve hospedar o SonarQube em um servidor acessível publicamente.

#### Requisitos

- Servidor com Docker/Docker Compose
- Domínio ou IP público
- Certificado SSL (HTTPS)

#### Passos

1. **Deploy do SonarQube**:
   ```bash
   # No servidor
   git clone <seu-repo>
   cd constrsw-2025-2
   docker compose up -d postgresql sonarqube
   ```

2. **Configurar HTTPS** (usando Nginx como reverse proxy):
   ```nginx
   server {
       listen 443 ssl;
       server_name sonarqube.seudominio.com;
       
       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;
       
       location / {
           proxy_pass http://localhost:9000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

3. **Configurar secret no GitHub**:
   - `SONAR_HOST_URL`: `https://sonarqube.seudominio.com`

---

### Opção 3: SonarCloud (Alternativa SaaS)

Se preferir não gerenciar infraestrutura, use o **SonarCloud** (gratuito para projetos open source).

#### Configuração

1. **Criar conta**: https://sonarcloud.io (conecte com GitHub)

2. **Adicionar projeto**:
   - Vá em **"Add new project"**
   - Selecione seu repositório GitHub
   - O SonarCloud cria o projeto automaticamente

3. **Obter token**:
   - **My Account → Security → Generate Token**

4. **Atualizar workflow**:
   - Substitua `sonarsource/sonarqube-scan-action` por `SonarCloud/sonarcloud-github-action`
   - Use `SONAR_TOKEN` do SonarCloud
   - Use `SONAR_ORGANIZATION` e `SONAR_PROJECT_KEY` do SonarCloud

5. **Configurar secrets no GitHub**:
   - `SONAR_TOKEN`: token do SonarCloud
   - `SONAR_ORGANIZATION`: sua organização no SonarCloud
   - `SONAR_PROJECT_KEY`: chave do projeto (ex: `constrsw-2025-2`)

---

## Configuração dos Secrets no GitHub

Independente da opção escolhida, você precisa configurar os secrets:

1. **Acesse**: `https://github.com/<seu-usuario>/<seu-repo>/settings/secrets/actions`

2. **Adicione os secrets**:
   - `SONAR_TOKEN`: Token gerado no SonarQube (ou SonarCloud)
   - `SONAR_HOST_URL`: URL do seu SonarQube
     - ngrok: `https://abc123.ngrok.io`
     - Servidor público: `https://sonarqube.seudominio.com`
     - SonarCloud: `https://sonarcloud.io`

---

## Testando a Configuração

Após configurar, teste o workflow:

1. **Faça um commit e push**:
   ```bash
   git add .
   git commit -m "test: sonarqube workflow"
   git push
   ```

2. **Verifique o workflow**:
   - Vá em: **Actions** no GitHub
   - Veja o workflow "SonarQube Analysis" executando

3. **Verifique no SonarQube**:
   - Acesse seu SonarQube (via ngrok ou servidor)
   - Veja os projetos sendo criados/atualizados

---

## Troubleshooting

### Erro: "Unable to connect to SonarQube server"

- Verifique se o SonarQube está rodando: `docker compose ps sonarqube`
- Verifique se a URL em `SONAR_HOST_URL` está correta
- Se usando ngrok, verifique se o túnel está ativo: `ngrok api tunnels list`

### Erro: "Invalid authentication credentials"

- Verifique se o `SONAR_TOKEN` está correto
- Gere um novo token no SonarQube se necessário

### Erro: "Project does not exist"

- Crie o projeto manualmente no SonarQube primeiro
- Ou configure o workflow para criar automaticamente (adicionar `-Dsonar.projectKey=...`)

---

## Notas Importantes

- **ngrok**: URLs mudam a cada reinício (exceto com plano pago). Atualize o secret quando necessário.
- **Segurança**: Nunca commite tokens ou URLs sensíveis. Use sempre secrets do GitHub.
- **Limites**: SonarQube Community tem limites de análise. Considere SonarCloud para projetos maiores.
