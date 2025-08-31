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

## 🧪 Como Rodar os Testes

Para garantir que a aplicação funcione como esperado, executamos testes unitários nas suas principais funcionalidades

Para rodar os testes, utilize o seguinte comando no terminal, substituindo <container-id> pelo ID do seu contêiner contendo o FastApi:

`docker exec -it <container-id> sh -c "export PYTHONPATH=/app && pytest"`

* docker exec -it <container-id>: Executa um comando interativo dentro do seu contêiner Docker.

* export PYTHONPATH=/app: Esta variável de ambiente informa ao Python onde encontrar os módulos do projeto (routers, services, main, etc.), garantindo que as importações funcionem corretamente dentro do contêiner.

* pytest: Inicia o executor de testes Pytest, que vai encontrar e rodar todos os testes na sua aplicação.

Para descobrir o ID de seus contêiners, execute o seguinte comando:

`docker ps`
