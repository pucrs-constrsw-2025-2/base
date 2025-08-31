import pytest
from fastapi.testclient import TestClient
from main import app
from unittest import mock
import json
from exceptions import APIException

client = TestClient(app)

# Um token de mock para ser usado nos testes
MOCK_AUTH_HEADER = {"Authorization": "Bearer fake-token"}


@pytest.fixture
def mock_create_user():
    with mock.patch('routers.users.create_keycloak_user') as mock_create_user_service:
        yield mock_create_user_service

def test_create_user_success(mock_create_user):
    # Mock do sucesso na criação do usuário
    mock_create_user.return_value = {"message": "Usuário criado com sucesso", "user": {"username": "newuser"}}
    
    # Payload completo para corresponder ao modelo UserCreate
    payload = {
        "username": "newuser",
        "first_name": "New",
        "last_name": "User",
        "email": "newuser@example.com",
        "credentials": [{"type": "password", "value": "newpassword", "temporary": False}]
    }

    response = client.post(
        "/users", json=payload, headers=MOCK_AUTH_HEADER
    )

    assert response.status_code == 201
    assert response.json() == {"message": "Usuário criado com sucesso", "user": {"username": "newuser"}}

def test_create_user_failure(mock_create_user):
    # Mock de falha na criação do usuário (usuário já existe)
    mock_create_user.side_effect = APIException(status_code=409, description="Usuário já existe", error_code="RS-409-01", source="UserService")

    # Payload completo para corresponder ao modelo UserCreate
    payload = {
        "username": "existinguser",
        "first_name": "Existing",
        "last_name": "User",
        "email": "user@example.com",
        "credentials": [{"type": "password", "value": "password123", "temporary": False}]
    }

    response = client.post(
        "/users", json=payload, headers=MOCK_AUTH_HEADER
    )

    assert response.status_code == 409
    assert response.json() == {"detail": "Usuário já existe"}

@pytest.fixture
def mock_update_password_service():
    with mock.patch('routers.users.update_keycloak_user_password') as mock_service:
        yield mock_service


def test_patch_update_password_success(mock_update_password_service):
    # Mock do sucesso na atualização da senha do usuário
    mock_update_password_service.return_value = None
    
    response = client.patch(
        "/users/123", json={"password": "updatedpassword"}, headers=MOCK_AUTH_HEADER
    )

    assert response.status_code == 204

def test_patch_update_password_failure(mock_update_password_service):
    # Mock de falha na atualização da senha do usuário
    mock_update_password_service.side_effect = APIException(status_code=400, description="Erro ao atualizar a senha.", error_code="RS-400-01", source="UserService")
    
    response = client.patch(
        "/users/123", json={"password": "updatedpassword"}, headers=MOCK_AUTH_HEADER
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Erro ao atualizar a senha."

@pytest.fixture
def mock_update_user_data():
    with mock.patch('routers.users.update_keycloak_user_data') as mock_service:
        yield mock_service

def test_put_user_success(mock_update_user_data):
    # Mock do sucesso na substituição do usuário
    mock_update_user_data.return_value = None

    # Payload completo para corresponder ao modelo UserUpdate
    payload = {
        "username": "replaceduser",
        "first_name": "Replaced",
        "last_name": "User",
        "email": "replaceduser@example.com",
        "password": "newpassword"
    }
    response = client.put(
        "/users/123", json=payload, headers=MOCK_AUTH_HEADER
    )

    assert response.status_code == 204

def test_put_user_failure(mock_update_user_data):
    # Mock de falha na substituição do usuário
    mock_update_user_data.side_effect = APIException(status_code=400, description="Erro ao atualizar usuário.", error_code="RS-400-01", source="UserService")

    # Payload completo para corresponder ao modelo UserUpdate
    payload = {
        "username": "replaceduser",
        "first_name": "Replaced",
        "last_name": "User",
        "email": "replaceduser@example.com",
        "password": "newpassword"
    }
    response = client.put(
        "/users/123", json=payload, headers=MOCK_AUTH_HEADER
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Erro ao atualizar usuário."
