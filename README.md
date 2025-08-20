## 🏗️ Grupo 1: Arquitetura e Estrutura

Nossa API de microsserviços, desenvolvida em **Python** com o framework **FastAPI**, é a espinha dorsal de um sistema completo.

---

## 📚 O Coração do Sistema: Oauth Service

Para gerenciar a autenticação e autorização, desenvolvemos o **Oauth Service**. Ele age como um intermediário entre nossa API e o **Keycloak**, um servidor de código aberto para gerenciamento de identidade.

* O Oauth Service se comunica com o Keycloak, traduzindo as requisições da nossa API e aplicando uma camada extra de validação. Por exemplo, ao criar um novo usuário, ele verifica o formato do e-mail usando uma expressão regular.
* Isso nos permite focar na lógica de negócio, enquanto o Oauth Service e o Keycloak cuidam das complexidades de segurança.

---

## 🛠️ Como Executar a Aplicação

1.  Certifique-se de ter o Docker e o Docker Compose instalados.
2. Navegue até a pasta raiz do projeto.
3. No terminal, criar o volume externo: `docker volume create constrsw-keycloak-data`.
4.  Execute o comando `docker compose up --build` para construir as imagens e iniciar os contêineres.

O arquivo `docker-compose.yml` se encarregará de iniciar o Keycloak e os outros serviços, garantindo que tudo funcione perfeitamente.