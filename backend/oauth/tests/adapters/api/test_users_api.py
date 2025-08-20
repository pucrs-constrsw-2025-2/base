import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock

from oauth_api.main import app
from oauth_api.core.services.user_service import UserService
from oauth_api.core.exceptions import UserAlreadyExistsError, UserNotFoundError
from oauth_api.core.domain.user import User
from oauth_api.adapters.api.dependencies import get_user_service, oauth2_scheme

# Mock do serviço que será injetado nos testes
mock_user_service = AsyncMock(spec=UserService)

# Sobrescreve a dependência de segurança para que os testes não precisem de um token real
def override_oauth2_scheme():
    pass

app.dependency_overrides[get_user_service] = lambda: mock_user_service
app.dependency_overrides[oauth2_scheme] = override_oauth2_scheme


client = TestClient(app)

@pytest.fixture(autouse=True)
def reset_mock_service():
    """Reseta o estado do mock antes de cada teste para garantir isolamento."""
    mock_user_service.reset_mock()
    yield

def test_create_user_api_success():
    """
    Valida a criação de um usuário via endpoint POST /users com sucesso.
    """
    # Arrange
    user_request_data = {"username": "api_user", "email": "api@test.com", "password": "securepassword"}
    user_domain_data = {
        "id": "new-user-id",
        "username": "api_user",
        "email": "api@test.com",
        "first_name": "Api",
        "last_name": "User",
        "enabled": True
    }
    expected_response_data = {"id": "new-user-id", "username": "api_user", "email": "api@test.com"}
    
    mock_user_service.create_user.return_value = User(**user_domain_data)

    # Act
    response = client.post("/users", json=user_request_data)

    # Assert
    assert response.status_code == 201
    assert response.json() == expected_response_data
    mock_user_service.create_user.assert_called_once()

def test_create_user_api_conflict():
    """
    Valida a resposta 409 Conflict quando o usuário já existe.
    """
    # Arrange
    user_request_data = {"username": "existing_user", "email": "existing@test.com", "password": "password"}
    mock_user_service.create_user.side_effect = UserAlreadyExistsError("User already exists")

    # Act
    response = client.post("/users", json=user_request_data)

    # Assert
    assert response.status_code == 409
    error_data = response.json()
    assert error_data["error_code"] == "OA-409"
    assert "User already exists" in error_data["error_description"]

def test_get_user_by_id_api_not_found():
    """Valida a resposta 404 Not Found ao buscar um usuário inexistente."""
    # Arrange
    user_id = "non-existent-id"
    mock_user_service.find_user_by_id.side_effect = UserNotFoundError(f"User with id {user_id} not found")

    # Act
    response = client.get(f"/users/{user_id}")

    # Assert
    assert response.status_code == 404
    error_data = response.json()
    assert error_data["error_code"] == "OA-404"
    assert f"User with id {user_id} not found" in error_data["error_description"]

def test_create_user_invalid_email():
    """
    Valida a resposta 422 Unprocessable Entity para dados de entrada inválidos.
    """
    # Arrange
    invalid_user_data = {"username": "bad_email_user", "email": "not-an-email", "password": "password"}

    # Act
    response = client.post("/users", json=invalid_user_data)

    # Assert
    assert response.status_code == 422
    assert "value is not a valid email address" in response.text

def test_get_users_with_filter():
    """Valida a listagem de usuários aplicando um filtro via query parameter."""
    # Arrange
    mock_user_service.find_all.return_value = [
        User(id="user-1", username="active_user", email="active@test.com", first_name="Active", last_name="User", enabled=True)
    ]

    # Act
    response = client.get("/users?enabled=true")

    # Assert
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["username"] == "active_user"
    mock_user_service.find_all.assert_called_once_with(enabled=True)

def test_create_user_api_success():
    """Valida a criação de um usuário via endpoint POST /users com sucesso."""
    # Arrange
    user_request_data = {"username": "api_user", "email": "api@test.com", "password": "securepassword"}
    user_domain_data = {
        "id": "new-user-id",
        "username": "api_user",
        "email": "api@test.com",
        "first_name": "Api",
        "last_name": "User",
        "enabled": True
    }
    expected_response_data = {"id": "new-user-id", "username": "api_user", "email": "api@test.com"}
    
    mock_user_service.create_user.return_value = User(**user_domain_data)

    # Act
    response = client.post("/users", json=user_request_data)

    # Assert
    assert response.status_code == 201
    assert response.json() == expected_response_data
    mock_user_service.create_user.assert_called_once()

def test_reset_password_api_success():
    """
    Valida a atualização de senha via PATCH /users/{id}.
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

def test_delete_user_api_success():
    """
    Valida a exclusão lógica de um usuário via DELETE /users/{id}.
    """
    # Arrange
    user_id = "user-to-delete"
    mock_user_service.disable_user.return_value = None

    # Act
    response = client.delete(f"/users/{user_id}")

    # Assert
    assert response.status_code == 204
    mock_user_service.disable_user.assert_called_once_with(user_id)