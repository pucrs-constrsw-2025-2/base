# --- tests/test_config.py ---
# Testes para o módulo de configuração.

def test_settings_load_from_env(monkeypatch):
    """
    Testa que as configurações são carregadas corretamente das variáveis de ambiente
    e que as propriedades computadas (URLs) são geradas como esperado.
    """
    # Define variáveis de ambiente falsas para o teste
    monkeypatch.setenv("KEYCLOAK_SERVER_URL", "http://keycloak.test")
    monkeypatch.setenv("KEYCLOAK_REALM", "test-realm")
    monkeypatch.setenv("KEYCLOAK_CLIENT_ID", "test-client")
    monkeypatch.setenv("KEYCLOAK_CLIENT_SECRET", "a-secret")

    # Importa as configurações AQUI, depois de mockar o ambiente
    from oauth_api.config import Settings
    settings = Settings()

    assert settings.KEYCLOAK_SERVER_URL == "http://keycloak.test"
    assert settings.KEYCLOAK_REALM == "test-realm"
    assert settings.keycloak_token_url == "http://keycloak.test/realms/test-realm/protocol/openid-connect/token"
    assert settings.keycloak_jwks_url == "http://keycloak.test/realms/test-realm/protocol/openid-connect/certs"
    assert settings.keycloak_admin_api_url == "http://keycloak.test/admin/realms/test-realm"


# --- tests/test_integration/adapters/api/test_error_handler.py ---
# Testes para o tratador de exceções da API.

import json

import pytest

from oauth_api.adapters.api.error_handler import api_exception_handler
from oauth_api.core.exceptions import NotFoundError


@pytest.mark.asyncio
async def test_api_exception_handler():
    """
    Testa se o handler de exceção captura uma BaseAPIException
    e a formata na resposta JSON padronizada.
    """
    exc = NotFoundError(description="Item não foi encontrado.", error_stack=["trace/here"])
    mock_request = None

    response = await api_exception_handler(mock_request, exc)

    assert response.status_code == 404

    expected_content = {
        "error_code": "OA-404",
        "error_description": "Item não foi encontrado.",
        "error_source": "OAuthAPI",
        "error_stack": ["trace/here"],
    }

    # CORREÇÃO: O objeto JSONResponse tem o conteúdo em .body (bytes)
    # e precisa ser decodificado para um dicionário Python.
    assert json.loads(response.body) == expected_content


# --- tests/test_integration/adapters/keycloak/test_keycloak_client.py ---
# Testes para o cliente HTTP que conversa com o Keycloak.

import httpx
import pytest
from respx import MockRouter

from oauth_api.adapters.keycloak.keycloak_client import KeycloakAdminClient


@pytest.fixture
def mock_settings(monkeypatch):
    """
    Fixture para mockar as configurações de ambiente. Essencial para que
    o respx e o código da aplicação usem as mesmas URLs de teste.
    """
    monkeypatch.setenv("KEYCLOAK_SERVER_URL", "http://keycloak.test")
    monkeypatch.setenv("KEYCLOAK_REALM", "test-realm")
    monkeypatch.setenv("KEYCLOAK_CLIENT_ID", "test-client")
    monkeypatch.setenv("KEYCLOAK_CLIENT_SECRET", "a-secret")

    # Força o módulo de settings a recarregar com as novas variáveis de ambiente
    import importlib

    from oauth_api import config
    importlib.reload(config)
    return config.settings


import pytest


@pytest.fixture
def mock_settings(monkeypatch):
    """
    Fixture para mockar as configurações de ambiente.
    A CORREÇÃO PRINCIPAL ESTÁ AQUI: Além de recarregar o módulo de config,
    nós usamos monkeypatch.setattr para substituir o objeto 'settings'
    diretamente dentro do módulo 'keycloak_client' onde ele é importado e usado.
    Isso garante que o KeycloakAdminClient use as nossas configurações de teste.
    """
    monkeypatch.setenv("KEYCLOAK_SERVER_URL", "http://keycloak.test")
    monkeypatch.setenv("KEYCLOAK_REALM", "test-realm")
    monkeypatch.setenv("KEYCLOAK_CLIENT_ID", "test-client")
    monkeypatch.setenv("KEYCLOAK_CLIENT_SECRET", "a-secret")

    import importlib

    from oauth_api import config
    importlib.reload(config)

    # A MÁGICA ACONTECE AQUI:
    monkeypatch.setattr("oauth_api.adapters.keycloak.keycloak_client.settings", config.settings)

    return config.settings


@pytest.mark.asyncio
async def test_get_admin_token_success(respx_mock: MockRouter, mock_settings):
    """Testa a obtenção bem-sucedida do token de admin."""
    # Agora o respx_mock usa a URL correta vinda do mock_settings
    respx_mock.post(mock_settings.keycloak_token_url).mock(
        return_value=httpx.Response(200, json={"access_token": "new-admin-token"})
    )

    client = KeycloakAdminClient()
    token = await client._get_admin_token()

    assert token == "new-admin-token"
    assert client._admin_token == "new-admin-token"


@pytest.mark.asyncio
async def test_request_token_expired_and_refreshed(respx_mock: MockRouter, mock_settings):
    """Testa o fluxo de renovação automática do token quando ele expira (401)."""
    # Mock para as duas chamadas ao endpoint de token
    token_route = respx_mock.post(mock_settings.keycloak_token_url)
    token_route.side_effect = [
        httpx.Response(200, json={"access_token": "expired-token"}),
        httpx.Response(200, json={"access_token": "refreshed-token"}),
    ]

    # Mock para as duas chamadas ao endpoint de usuários
    users_route = respx_mock.get(f"{mock_settings.keycloak_admin_api_url}/users")
    users_route.side_effect = [
        httpx.Response(401),  # Primeira chamada falha com token expirado
        httpx.Response(200, json=[{"id": "success"}]),  # Segunda chamada funciona com token novo
    ]

    client = KeycloakAdminClient()
    response_data = await client.get("/users")

    assert response_data == [{"id": "success"}]
    assert token_route.call_count == 2  # Deve chamar o token duas vezes
    assert users_route.call_count == 2  # Deve chamar a rota de usuários duas vezes

# --- tests/test_integration/adapters/keycloak/test_keycloak_repositories.py ---
# Testes para as implementações concretas dos repositórios.


from unittest.mock import AsyncMock

import pytest

from oauth_api.adapters.keycloak.keycloak_role_repository import KeycloakRoleRepository
from oauth_api.adapters.keycloak.keycloak_user_repository import KeycloakUserRepository

# CORREÇÃO: Payload de usuário válido e completo que passa na validação do Pydantic
VALID_KC_USER_PAYLOAD = {
    "id": "123",
    "username": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "enabled": True,
}


@pytest.fixture
def mock_keycloak_client():
    return AsyncMock()


@pytest.mark.asyncio
async def test_user_repo_find_all_with_filter(mock_keycloak_client):
    """Testa a busca de todos os usuários com filtro 'enabled'."""
    mock_keycloak_client.get.return_value = [
        VALID_KC_USER_PAYLOAD,
        {**VALID_KC_USER_PAYLOAD, "id": "2", "enabled": False},
    ]
    repo = KeycloakUserRepository(mock_keycloak_client)
    users = await repo.find_all(enabled=True)
    assert len(users) == 1
    assert users[0].id == "123"


@pytest.mark.asyncio
async def test_user_repo_create_success(mock_keycloak_client):
    """Testa a criação de um usuário com sucesso."""
    mock_response = AsyncMock()
    mock_response.headers = {"location": "http://.../users/new-user-id"}
    mock_keycloak_client.post.return_value = mock_response
    mock_keycloak_client.get.return_value = {**VALID_KC_USER_PAYLOAD, "id": "new-user-id"}

    repo = KeycloakUserRepository(mock_keycloak_client)
    user_data = {
        "username": "u@example.com",
        "first_name": "f",
        "last_name": "l",
        "password": "p"
    }
    new_user = await repo.create(user_data)

    assert new_user.id == "new-user-id"


@pytest.mark.asyncio
async def test_role_repo_update(mock_keycloak_client):
    """Testa a atualização de um role."""
    mock_keycloak_client.get.return_value = {"id": "role-1", "name": "old-name", "description": "old-desc"}

    repo = KeycloakRoleRepository(mock_keycloak_client)
    update_data = {"name": "new-name"}
    updated_role = await repo.update("role-1", update_data)

    assert updated_role.name == "new-name"
    assert updated_role.description == "old-desc"
    mock_keycloak_client.put.assert_awaited_once()
