# Estratégia de Persistência e Evolução do Access Token em SPA Angular + Keycloak

Este documento descreve duas abordagens progressivas para lidar com **tokens de acesso (access tokens)** em um frontend **Angular** com **Angular Material**, consumindo uma **REST API OAuth** implementada como gateway sobre o **Keycloak**.

---

## Etapa 1 — Persistência do Access Token no Frontend

### Objetivo
Viabilizar rapidamente a autenticação no SPA, mesmo sabendo que **persistir tokens no navegador aumenta a superfície de ataque (XSS)**.  
Nesta etapa o foco é simplicidade com controles de mitigação.

### Fluxo
1. Utilizar **Authorization Code + PKCE** diretamente contra o Keycloak.  
2. O **SPA recebe o access token** (tempo de vida curto: 3–10 minutos).  
3. Persistência em **`sessionStorage`** (sobrevive a refresh da página, mas não a fechamento da aba).  
4. **Silent re-auth** (renovação) via `prompt=none` em **iframe oculto** usando o cookie de SSO do Keycloak.

### Mitigações
- **Content Security Policy (CSP)** estrita (sem `unsafe-inline`).  
- **Subresource Integrity (SRI)** em bundles externos.  
- **Sanitização rigorosa** de HTML/URLs.  
- **TTL curto** e escopos mínimos do token.  
- **Rotação de chaves** no realm do Keycloak.  
- Uso opcional de **DPoP** para reduzir replay.

### Implementação Angular
- Guardar token no `sessionStorage` via um `TokenStorageService`.  
- Interceptor HTTP adiciona `Authorization: Bearer ...`.  
- Em caso de `401`, o interceptor aciona **silent re-auth**.  

### Limitações
- XSS ainda pode roubar o token.  
- Sincronização entre múltiplas abas exige `BroadcastChannel`.  
- Sem anti-CSRF baseado em cookies.  

---

## Etapa 2 — Evolução para Modelo BFF/Híbrido

### Objetivo
Eliminar persistência de tokens acessíveis ao JavaScript, transferindo a renovação de credenciais para o **gateway/BFF**.

### Fluxo
1. SPA inicia com **Authorization Code + PKCE**.  
2. A troca de `code → tokens` é feita pelo **gateway/BFF**.  
3. O **refresh token** nunca chega ao navegador: fica no servidor ou em cookie **HttpOnly + Secure + SameSite**.  
4. Angular mantém **access token apenas em memória** (ou nenhum token, se a sessão for gerida por cookie).  
5. Renovação acontece via endpoint `/session/refresh` do BFF.

### Variantes
- **A) Access token em memória**  
  - SPA solicita `/session/refresh` → BFF devolve `access_token` curto (JSON).  
  - Interceptor atualiza token em memória.  

- **B) Sessão por cookie (sem expor Bearer)**  
  - Angular envia `withCredentials: true`.  
  - BFF injeta `Authorization` ao backend.  
  - Proteção via **anti-CSRF token** em header customizado.  

### Controles de Segurança
- Cookies com flags: `HttpOnly; Secure; SameSite=Lax|Strict`.  
- **Anti-CSRF tokens**.  
- **TTL curto** de access tokens + **rotating refresh tokens**.  
- **CSP** continua obrigatória.  
- **Logout**: BFF revoga sessão no Keycloak e apaga cookies.  

---

## Comparativo

| Critério                | Etapa 1 (SPA persistindo)      | Etapa 2 (BFF/Híbrido)          |
|--------------------------|--------------------------------|--------------------------------|
| Exposição a XSS         | Maior (token no storage)       | Bem menor (sem storage)        |
| Complexidade infra       | Baixa                         | Média (BFF, cookies, CSRF)     |
| Renovação                | Silent re-auth (iframe)        | Refresh no BFF (HttpOnly)      |
| Multi-domínio / CORS     | Pode complicar                 | Centraliza no gateway          |
| Auditoria / Revogação    | Apenas no Keycloak             | No BFF + Keycloak              |

---

## Plano de Migração
1. Criar **abstração de Auth** no Angular (`AuthService` com `getToken()`, `refresh()`, `logout()`).  
2. Introduzir endpoint `/session/refresh` no gateway.  
3. Alterar o interceptor para buscar o token em memória, não mais do `sessionStorage`.  
4. Habilitar **cookies HttpOnly** e **anti-CSRF**.  
5. Desativar silent re-auth por iframe.  
6. Auditar **CORS, SameSite e TTLs** em produção.  

---

## TL;DR
- **Etapa 1**: Code+PKCE → `sessionStorage` → Silent re-auth via iframe.  
- **Etapa 2**: BFF com cookies HttpOnly → Access token só em memória (ou nenhuma exposição).  
- Resultado: **mais segurança contra XSS e CSRF**, mantendo a usabilidade no Angular.
