import pytest
from fastapi.testclient import TestClient
from main import app
from unittest import mock

client = TestClient(app)

# Um token de mock para ser usado nos testes
MOCK_AUTH_HEADER = {"authorization": "Bearer fake-token"}


@pytest.fixture
def mock_create_role():
    with mock.patch('routers.roles.create_role') as mock_create_role_service:
        yield mock_create_role_service

def test_create_role_success(mock_create_role):
    # Mock do sucesso na criação da role
    mock_create_role.return_value = {"message": "Role criada com sucesso", "role": {"name": "admin"}}

    response = client.post(
        "/roles", json={"name": "admin", "description": "Admin role"}, headers=MOCK_AUTH_HEADER
    )

    assert response.status_code == 201
    assert response.json() == {"message": "Role criada com sucesso", "role": {"name": "admin"}}

def test_create_role_failure(mock_create_role):
    # Mock de falha na criação da role (role já existe)
    mock_create_role.side_effect = Exception("Role já existe")

    response = client.post(
        "/roles", json={"name": "admin", "description": "Admin role"}, headers=MOCK_AUTH_HEADER
    )

    assert response.status_code == 409
    assert response.json() == {"detail": "Role já existe"}

@pytest.fixture
def mock_patch_role():
    # Agora o mock aponta para a função correta
    with mock.patch('routers.roles.patch_role') as mock_patch_role_service:
        yield mock_patch_role_service

def test_patch_role_success(mock_patch_role):
    # Mock do sucesso na atualização da role
    mock_patch_role.return_value = None  # O endpoint retorna 204 sem conteúdo

    response = client.patch(
        "/roles/123", json={"name": "admin", "description": "Updated role"}, headers=MOCK_AUTH_HEADER
    )

    assert response.status_code == 204

def test_patch_role_failure(mock_patch_role):
    # Mock de falha na atualização da role
    mock_patch_role.side_effect = Exception("Erro ao atualizar role")

    response = client.patch(
        "/roles/123", json={"name": "admin", "description": "Updated role"}, headers=MOCK_AUTH_HEADER
    )

    assert response.status_code == 400
    assert response.json() == {"detail": "Erro ao atualizar role"}

@pytest.fixture
def mock_update_role():
    # O mock aponta para a função correta
    with mock.patch('routers.roles.update_role') as mock_update_role_service:
        yield mock_update_role_service

def test_put_role_success(mock_update_role):
    # Mock do sucesso na substituição da role
    mock_update_role.return_value = None  # O endpoint retorna 204 sem conteúdo

    response = client.put(
        "/roles/123", json={"name": "admin", "description": "Replaced role"}, headers=MOCK_AUTH_HEADER
    )

    assert response.status_code == 204

def test_put_role_failure(mock_update_role):
    # Mock de falha na substituição da role
    mock_update_role.side_effect = Exception("Erro ao substituir role")

    response = client.put(
        "/roles/123", json={"name": "admin", "description": "Replaced role"}, headers=MOCK_AUTH_HEADER
    )

    assert response.status_code == 400
    assert response.json() == {"detail": "Erro ao substituir role"}
