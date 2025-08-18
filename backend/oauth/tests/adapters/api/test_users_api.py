import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock

from oauth_api.main import app # Importa a instância principal do FastAPI
from oauth_api.core.services.user_service import UserService
from oauth_api.core.exceptions import UserAlreadyExistsException, UserNotFoundException
from oauth_api.core.domain.user import User

# Mock do serviço que será injetado nos testes
mock_user_service = MagicMock(spec=UserService)

# Sobrescreve a dependência do UserService globalmente para os testes deste módulo
# A função 'get_user_service' seria uma dependência no seu 'dependencies.py'
# from oauth_api.adapters.api.dependencies import get_user_service
# app.dependency_overrides[get_user_service] = lambda: mock_user_service

# Por simplicidade, se a injeção for direta na rota, o override é similar.
# Vamos assumir que a dependência é resolvida e podemos sobrescrevê-la.
# NOTA: A forma exata de sobrescrever depende de como a injeção é definida no código.
# Assumindo uma função de dependência `get_user_service` em `dependencies.py`

# Esta é uma maneira de simular o override se a dependência não estiver disponível
# para importação direta. Em um projeto real, você importaria a dependência real.
def override_user_service():
    return mock_user_service

# O ideal é importar o provedor da dependência e sobrescrevê-lo
# from oauth_api.adapters.api.dependencies import get_user_service 
# app.dependency_overrides[get_user_service] = override_user_service

client = TestClient(app)

@pytest.fixture(autouse=True)
def reset_mock_service():
    """Reseta o estado do mock antes de cada teste para garantir isolamento."""
    mock_user_service.reset_mock()
    yield

def test_create_user_api_success():
    """
    Valida a criação de um usuário via endpoint POST /users com sucesso.
    Importância: Testa o fluxo completo da API, desde a validação do request,
    passando pela chamada ao serviço (mockado) e a formatação da resposta HTTP 201.
    """
    # Arrange
    user_request_data = {"username": "api_user", "email": "api@test.com", "password": "securepassword"}
    expected_response_data = {"id": "new-user-id", "username": "api_user", "email": "api@test.com"}
    
    mock_user_service.create_user.return_value = User(id="new-user-id", **user_request_data)

    # Act
    response = client.post("/users", json=user_request_data)

    # Assert
    assert response.status_code == 201
    assert response.json() == expected_response_data
    mock_user_service.create_user.assert_called_once()

def test_create_user_api_conflict():
    """
    Valida a resposta 409 Conflict quando o usuário já existe.
    Importância: Garante que as exceções da camada de negócio são corretamente
    traduzidas em respostas de erro HTTP pelo middleware de tratamento de erros.
    """
    # Arrange
    user_request_data = {"username": "existing_user", "email": "existing@test.com", "password": "password"}
    mock_user_service.create_user.side_effect = UserAlreadyExistsException("User already exists")

    # Act
    response = client.post("/users", json=user_request_data)

    # Assert
    assert response.status_code == 409
    # Valida se a resposta de erro segue o padrão definido no projeto
    error_data = response.json()
    assert error_data["error_code"] == "OA-409" # Exemplo de código de erro
    assert "User already exists" in error_data["error_description"]
    assert error_data["error_source"] == "OAuthAPI"

def test_get_user_by_id_api_not_found():
    """
    Valida a resposta 404 Not Found ao buscar um usuário inexistente.
    Importância: Similar ao teste de conflito, verifica se o erro de "não encontrado"
    é corretamente mapeado para o status HTTP apropriado.
    """
    # Arrange
    user_id = "non-existent-id"
    mock_user_service.find_user_by_id.side_effect = UserNotFoundException(f"User with id {user_id} not found")

    # Act
    response = client.get(f"/users/{user_id}")

    # Assert
    assert response.status_code == 404
    error_data = response.json()
    assert error_data["error_code"] == "OA-404" # Exemplo de código de erro
    assert f"User with id {user_id} not found" in error_data["error_description"]

def test_create_user_invalid_email():
    """
    Valida a resposta 422 Unprocessable Entity para dados de entrada inválidos.
    Importância: Confirma que a validação do Pydantic está ativa e funcionando,
    prevenindo que dados malformados cheguem à lógica de negócio.
    """
    # Arrange
    invalid_user_data = {"username": "bad_email_user", "email": "not-an-email", "password": "password"}

    # Act
    response = client.post("/users", json=invalid_user_data)

    # Assert
    assert response.status_code == 422 # Status padrão do FastAPI para erros de validação
    # O Pydantic/FastAPI gera uma resposta detalhada sobre o erro
    assert "value is not a valid email address" in response.text

def test_get_users_with_filter(client, mock_user_service):
    """
    Valida a listagem de usuários aplicando um filtro via query parameter.
    Importância: Garante que a camada da API processa corretamente os parâmetros
    de consulta (query params) e os repassa para a camada de serviço.
    """
    # Arrange
    mock_user_service.find_all.return_value = [
        User(id="user-1", username="active_user", email="active@test.com", enabled=True)
    ]

    # Act
    response = client.get("/users?enabled=true")

    # Assert
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["username"] == "active_user"
    # Verifica se o serviço foi chamado com o filtro correto
    mock_user_service.find_all.assert_called_once_with(enabled=True)

def test_update_user_api_success(client, mock_user_service):
    """
    Valida a atualização completa de um usuário via PUT /users/{id}.
    Importância: Testa o fluxo de atualização da API, incluindo a desserialização
    do corpo da requisição e a chamada ao serviço correspondente.
    """
    # Arrange
    user_id = "user-to-update"
    update_data = {"username": "updated_user", "email": "updated@test.com", "firstName": "Updated"}
    
    # O método de serviço não precisa retornar nada em uma atualização
    mock_user_service.update_user.return_value = None

    # Act
    response = client.put(f"/users/{user_id}", json=update_data)

    # Assert
    assert response.status_code == 200 # Ou 204 No Content, dependendo da implementação
    mock_user_service.update_user.assert_called_once_with(user_id, update_data)

def test_reset_password_api_success(client, mock_user_service):
    """
    Valida a atualização de senha via PATCH /users/{id}.
    Importância: Testa um endpoint de atualização parcial (PATCH) que lida com
    dados sensíveis, garantindo que a API invoca a lógica de negócio correta.
    """
    # Arrange
    user_id = "user-for-password-reset"
    password_data = {"password": "new_strong_password"}
    mock_user_service.reset_password.return_value = None

    # Act
    response = client.patch(f"/users/{user_id}", json=password_data)

    # Assert
    assert response.status_code == 200
    mock_user_service.reset_password.assert_called_once_with(user_id, "new_strong_password")

def test_delete_user_api_success(client, mock_user_service):
    """
    Valida a exclusão lógica de um usuário via DELETE /users/{id}.
    Importância: Assegura que o método HTTP DELETE está corretamente mapeado
    para a ação de desativação e que a resposta HTTP 204 No Content, que é o
    padrão para exclusões bem-sucedidas sem corpo de resposta, é retornada.
    """
    # Arrange
    user_id = "user-to-delete"
    mock_user_service.disable_user.return_value = None

    # Act
    response = client.delete(f"/users/{user_id}")

    # Assert
    assert response.status_code == 204
    mock_user_service.disable_user.assert_called_once_with(user_id)