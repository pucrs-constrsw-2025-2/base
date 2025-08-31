from unittest.mock import MagicMock

import httpx
import pytest
from fastapi.testclient import TestClient
from respx import MockRouter

from oauth_api.core.domain.role import Role

# Importa os objetos de domínio para usar como retornos mockados
from oauth_api.core.domain.user import User
from oauth_api.core.exceptions import ConflictAlreadyExistsError, NotFoundError

# Fixtures do conftest.py (client, mock_user_service, mock_role_service) são injetadas automaticamente

# --- Objetos Mock para Respostas ---
VALID_USER = User(
    id="user-123",
    username="test@example.com",
    first_name="Test",
    last_name="User",
    enabled=True,
)
VALID_ROLE = Role(id="role-123", name="admin", description="Admin Role")

# --- Testes de Autenticação (/login) ---


@pytest.fixture
def mock_auth_settings(monkeypatch):
    """Fixture para mockar as configurações de ambiente para os testes de login."""
    monkeypatch.setenv("KEYCLOAK_SERVER_URL", "http://keycloak.test")
    monkeypatch.setenv("KEYCLOAK_REALM", "test-realm")
    monkeypatch.setenv("KEYCLOAK_CLIENT_ID", "test-client")
    monkeypatch.setenv("KEYCLOAK_CLIENT_SECRET", "a-secret")
    # Força o módulo a recarregar as configurações mockadas
    import importlib

    from oauth_api import adapters, config

    importlib.reload(config)
    # Garante que a rota de auth use as configurações de teste
    monkeypatch.setattr(adapters.api.routes.auth, "settings", config.settings)
    return config.settings


@pytest.mark.asyncio
async def test_login_success(
    client: TestClient, respx_mock: MockRouter, mock_auth_settings
):
    """Testa o fluxo de login bem-sucedido."""
    token_data = {
        "access_token": "um-token-jwt",
        "expires_in": 300,
        "refresh_expires_in": 1800,
        "refresh_token": "refresh",
        "token_type": "Bearer",
    }
    respx_mock.post(mock_auth_settings.keycloak_token_url).mock(
        return_value=httpx.Response(201, json=token_data)
    )

    response = client.post("/login", data={"username": "user", "password": "pw"})
    assert response.status_code == 201
    assert response.json()["access_token"] == "um-token-jwt"


@pytest.mark.asyncio
async def test_login_invalid_credentials(
    client: TestClient, respx_mock: MockRouter, mock_auth_settings
):
    """Testa o fluxo de login com credenciais inválidas (Keycloak retorna 401)."""
    respx_mock.post(mock_auth_settings.keycloak_token_url).mock(
        return_value=httpx.Response(401)
    )
    response = client.post("/login", data={"username": "user", "password": "wrong"})
    assert response.status_code == 401
    assert response.json()["error_code"] == "OA-401"


@pytest.mark.asyncio
async def test_login_keycloak_server_error(
    client: TestClient, respx_mock: MockRouter, mock_auth_settings
):
    """Testa como o login lida com um erro 500 do Keycloak."""
    respx_mock.post(mock_auth_settings.keycloak_token_url).mock(
        return_value=httpx.Response(500)
    )
    with pytest.raises(httpx.HTTPStatusError):
        client.post("/login", data={"username": "user", "password": "pw"})


# --- Testes das Rotas de Usuários (/users) ---


def test_create_user_route(client: TestClient, mock_user_service: MagicMock):
    mock_user_service.create_user.return_value = VALID_USER
    payload = {
        "username": "test@example.com",
        "password": "a-strong-password",
        "firstName": "Test",
        "lastName": "User",
    }
    response = client.post("/users", json=payload)
    assert response.status_code == 201
    assert response.json()["id"] == "user-123"
    mock_user_service.create_user.assert_awaited_once()


def test_get_all_users_route(client: TestClient, mock_user_service: MagicMock):
    mock_user_service.find_all.return_value = [VALID_USER]
    response = client.get("/users?enabled=true")
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["username"] == "test@example.com"
    mock_user_service.find_all.assert_awaited_once_with(enabled=True)


def test_get_user_by_id_success(client: TestClient, mock_user_service: MagicMock):
    mock_user_service.find_by_id.return_value = VALID_USER
    response = client.get("/users/user-123")
    assert response.status_code == 200
    assert response.json()["id"] == "user-123"


def test_update_user_route(client: TestClient, mock_user_service: MagicMock):
    mock_user_service.update_user.return_value = VALID_USER
    payload = {"firstName": "Updated", "lastName": "Name"}
    response = client.put("/users/user-123", json=payload)
    assert response.status_code == 200
    mock_user_service.update_user.assert_awaited_once()


def test_reset_password_route(client: TestClient, mock_user_service: MagicMock):
    response = client.patch("/users/user-123", json={"password": "new-strong-password"})
    assert response.status_code == 204
    mock_user_service.reset_password.assert_awaited_once_with(
        "user-123", "new-strong-password"
    )


def test_delete_user_route(client: TestClient, mock_user_service: MagicMock):
    response = client.delete("/users/user-123")
    assert response.status_code == 204
    mock_user_service.disable_user.assert_awaited_once_with("user-123")


def test_assign_roles_to_user_route(client: TestClient, mock_role_service: MagicMock):
    payload = {"role_ids": ["role-1", "role-2"]}
    response = client.post("/users/user-123/roles", json=payload)
    assert response.status_code == 204
    mock_role_service.assign_roles_to_user.assert_awaited_once_with(
        "user-123", ["role-1", "role-2"]
    )


def test_remove_roles_from_user_route(client: TestClient, mock_role_service: MagicMock):
    payload = {"role_ids": ["role-1"]}
    # CORREÇÃO: Usar client.request("DELETE", ...) para enviar um corpo JSON com um verbo DELETE.
    response = client.request("DELETE", "/users/user-123/roles", json=payload)
    assert response.status_code == 204
    mock_role_service.remove_roles_from_user.assert_awaited_once_with(
        "user-123", ["role-1"]
    )


# --- Testes das Rotas de Roles (/roles) ---


def test_create_role_route(client: TestClient, mock_role_service: MagicMock):
    mock_role_service.create_role.return_value = VALID_ROLE
    payload = {"name": "admin", "description": "Admin Role"}
    response = client.post("/roles", json=payload)
    assert response.status_code == 201
    assert response.json()["id"] == "role-123"
    mock_role_service.create_role.assert_awaited_once()


def test_create_role_conflict(client: TestClient, mock_role_service: MagicMock):
    mock_role_service.create_role.side_effect = ConflictAlreadyExistsError
    payload = {"name": "admin", "description": "Admin Role"}
    response = client.post("/roles", json=payload)
    assert response.status_code == 409
    assert response.json()["error_code"] == "OA-409"


def test_get_all_roles_route(client: TestClient, mock_role_service: MagicMock):
    mock_role_service.get_all_roles.return_value = [VALID_ROLE]
    response = client.get("/roles")
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["name"] == "admin"


def test_get_role_by_id_success(client: TestClient, mock_role_service: MagicMock):
    mock_role_service.get_role_by_id.return_value = VALID_ROLE
    response = client.get("/roles/role-123")
    assert response.status_code == 200
    assert response.json()["id"] == "role-123"


def test_get_role_by_id_not_found(client: TestClient, mock_role_service: MagicMock):
    mock_role_service.get_role_by_id.side_effect = NotFoundError
    response = client.get("/roles/not-found-id")
    assert response.status_code == 404
    assert response.json()["error_code"] == "OA-404"


def test_update_role_route(client: TestClient, mock_role_service: MagicMock):
    mock_role_service.update_role.return_value = VALID_ROLE
    payload = {"name": "new-name", "description": "new-desc"}
    response = client.put("/roles/role-123", json=payload)
    assert response.status_code == 200
    mock_role_service.update_role.assert_awaited_once()


def test_partial_update_role_route(client: TestClient, mock_role_service: MagicMock):
    mock_role_service.partial_update_role.return_value = VALID_ROLE
    payload = {"description": "new-desc"}
    response = client.patch("/roles/role-123", json=payload)
    assert response.status_code == 200
    mock_role_service.partial_update_role.assert_awaited_once()


def test_delete_role_route(client: TestClient, mock_role_service: MagicMock):
    response = client.delete("/roles/role-123")
    assert response.status_code == 204
    mock_role_service.delete_role.assert_awaited_once_with("role-123")
