# --- tests/adapters/test_keycloak.py ---

from unittest.mock import AsyncMock

import httpx
import pytest
from respx import MockRouter

from oauth_api.adapters.keycloak.keycloak_client import KeycloakAdminClient
from oauth_api.adapters.keycloak.keycloak_role_repository import KeycloakRoleRepository
from oauth_api.adapters.keycloak.keycloak_user_repository import KeycloakUserRepository
from oauth_api.core.domain.role import Role
from oauth_api.core.exceptions import (
    ConflictAlreadyExistsError,
    KeycloakAPIError,
    NotFoundError,
)

# --- Fixtures ---


@pytest.fixture
def mock_settings(monkeypatch):
    """Mocks Keycloak URLs and credentials."""
    monkeypatch.setenv("KEYCLOAK_SERVER_URL", "http://keycloak.test")
    monkeypatch.setenv("KEYCLOAK_REALM", "test-realm")
    monkeypatch.setenv("KEYCLOAK_CLIENT_ID", "test-client")
    monkeypatch.setenv("KEYCLOAK_CLIENT_SECRET", "a-secret")

    import importlib

    from oauth_api import config

    importlib.reload(config)

    monkeypatch.setattr(
        "oauth_api.adapters.keycloak.keycloak_client.settings", config.settings
    )
    return config.settings


@pytest.fixture
def mock_keycloak_client() -> AsyncMock:
    """Creates a mock of KeycloakAdminClient to inject into repositories."""
    return AsyncMock(spec=KeycloakAdminClient)


# --- Block 1: KeycloakAdminClient Tests ---


@pytest.mark.asyncio
async def test_client_get_admin_token_success(respx_mock: MockRouter, mock_settings):
    respx_mock.post(mock_settings.keycloak_token_url).mock(
        return_value=httpx.Response(200, json={"access_token": "admin-token"})
    )
    client = KeycloakAdminClient()
    token = await client._get_admin_token()
    assert token == "admin-token"


@pytest.mark.asyncio
async def test_client_get_admin_token_uses_cache(respx_mock: MockRouter, mock_settings):
    route = respx_mock.post(mock_settings.keycloak_token_url).mock(
        return_value=httpx.Response(200, json={"access_token": "admin-token"})
    )
    client = KeycloakAdminClient()
    await client._get_admin_token()
    await client._get_admin_token()
    assert route.call_count == 1


@pytest.mark.asyncio
async def test_client_get_admin_token_api_error(respx_mock: MockRouter, mock_settings):
    respx_mock.post(mock_settings.keycloak_token_url).mock(
        return_value=httpx.Response(500, text="Server Error")
    )
    client = KeycloakAdminClient()
    with pytest.raises(KeycloakAPIError) as exc_info:
        await client._get_admin_token()
    assert "Erro ao obter token de admin: Server Error" in exc_info.value.description


@pytest.mark.asyncio
async def test_client_request_token_expired_and_refreshed(
    respx_mock: MockRouter, mock_settings
):
    token_route = respx_mock.post(mock_settings.keycloak_token_url)
    token_route.side_effect = [
        httpx.Response(200, json={"access_token": "expired-token"}),
        httpx.Response(200, json={"access_token": "refreshed-token"}),
    ]
    users_url = f"{mock_settings.keycloak_admin_api_url}/users"
    users_route = respx_mock.get(users_url)
    users_route.side_effect = [
        httpx.Response(401),
        httpx.Response(200, json=[{"id": "success"}]),
    ]
    client = KeycloakAdminClient()
    response_data = await client.get("/users")
    assert response_data == [{"id": "success"}]
    assert token_route.call_count == 2
    assert users_route.call_count == 2


@pytest.mark.asyncio
async def test_client_request_non_401_error_raises_api_error(
    respx_mock: MockRouter, mock_settings
):
    respx_mock.post(mock_settings.keycloak_token_url).mock(
        return_value=httpx.Response(200, json={"access_token": "token"})
    )
    users_url = f"{mock_settings.keycloak_admin_api_url}/users"
    respx_mock.get(users_url).mock(
        return_value=httpx.Response(500, text="Generic Error")
    )

    client = KeycloakAdminClient()
    with pytest.raises(KeycloakAPIError) as exc_info:
        await client.get("/users")
    assert "Erro na API do Keycloak: Generic Error" in exc_info.value.description


# --- Block 2: KeycloakUserRepository Tests ---
VALID_KC_USER = {
    "id": "123",
    "username": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "enabled": True,
}
MINIMAL_USER_PAYLOAD = {
    "username": "u@a.com",
    "first_name": "f",
    "last_name": "l",
    "password": "p",
}


@pytest.mark.asyncio
async def test_user_repo_find_by_id_success(mock_keycloak_client: AsyncMock):
    mock_keycloak_client.get.return_value = VALID_KC_USER
    repo = KeycloakUserRepository(mock_keycloak_client)
    user = await repo.find_by_id("123")
    assert user.id == "123"


@pytest.mark.asyncio
async def test_user_repo_find_by_id_not_found_raises_error(
    mock_keycloak_client: AsyncMock,
):
    mock_keycloak_client.get.side_effect = KeycloakAPIError(404, "")
    repo = KeycloakUserRepository(mock_keycloak_client)
    with pytest.raises(NotFoundError):
        await repo.find_by_id("not-found")


@pytest.mark.asyncio
async def test_user_repo_find_by_email_success(mock_keycloak_client: AsyncMock):
    mock_keycloak_client.get.return_value = [VALID_KC_USER]
    repo = KeycloakUserRepository(mock_keycloak_client)
    user = await repo.find_by_email("test@example.com")
    assert user.id == "123"


@pytest.mark.asyncio
async def test_user_repo_find_by_email_not_found(mock_keycloak_client: AsyncMock):
    mock_keycloak_client.get.return_value = []
    repo = KeycloakUserRepository(mock_keycloak_client)
    user = await repo.find_by_email("notfound@example.com")
    assert user is None


@pytest.mark.asyncio
async def test_user_repo_find_all_with_filter(mock_keycloak_client: AsyncMock):
    mock_keycloak_client.get.return_value = [
        VALID_KC_USER,
        {**VALID_KC_USER, "id": "2", "enabled": False},
    ]
    repo = KeycloakUserRepository(mock_keycloak_client)

    users_enabled = await repo.find_all(enabled=True)
    assert len(users_enabled) == 1
    users_disabled = await repo.find_all(enabled=False)
    assert len(users_disabled) == 1
    all_users = await repo.find_all(enabled=None)
    assert len(all_users) == 2


@pytest.mark.asyncio
async def test_user_repo_create_success(mock_keycloak_client: AsyncMock):
    mock_response = AsyncMock(spec=httpx.Response)
    mock_response.headers = {"location": "http://.../users/new-user-id"}
    mock_keycloak_client.post.return_value = mock_response
    mock_keycloak_client.get.return_value = {**VALID_KC_USER, "id": "new-user-id"}
    repo = KeycloakUserRepository(mock_keycloak_client)
    new_user = await repo.create(MINIMAL_USER_PAYLOAD)
    assert new_user.id == "new-user-id"


@pytest.mark.asyncio
async def test_user_repo_create_conflict_raises_error(mock_keycloak_client: AsyncMock):
    mock_keycloak_client.post.side_effect = KeycloakAPIError(409, "")
    repo = KeycloakUserRepository(mock_keycloak_client)
    with pytest.raises(ConflictAlreadyExistsError):
        await repo.create(MINIMAL_USER_PAYLOAD)


@pytest.mark.asyncio
async def test_user_repo_create_missing_location_header_raises_error(
    mock_keycloak_client: AsyncMock,
):
    mock_response = AsyncMock(spec=httpx.Response)
    mock_response.headers = {}
    mock_keycloak_client.post.return_value = mock_response
    repo = KeycloakUserRepository(mock_keycloak_client)
    with pytest.raises(KeycloakAPIError, match="Header 'Location' não encontrado"):
        await repo.create(MINIMAL_USER_PAYLOAD)


@pytest.mark.asyncio
async def test_user_repo_update_success(mock_keycloak_client: AsyncMock):
    mock_keycloak_client.get.return_value = VALID_KC_USER
    repo = KeycloakUserRepository(mock_keycloak_client)
    await repo.update("123", {"first_name": "Updated"})
    mock_keycloak_client.put.assert_awaited_once()


@pytest.mark.asyncio
async def test_user_repo_update_user_not_found(mock_keycloak_client: AsyncMock):
    mock_keycloak_client.get.side_effect = NotFoundError()
    repo = KeycloakUserRepository(mock_keycloak_client)
    with pytest.raises(NotFoundError):
        await repo.update("not-found", {})


@pytest.mark.asyncio
async def test_user_repo_reset_password(mock_keycloak_client: AsyncMock):
    mock_keycloak_client.get.return_value = VALID_KC_USER
    repo = KeycloakUserRepository(mock_keycloak_client)
    await repo.reset_password("123", "new-pass")
    mock_keycloak_client.put.assert_awaited_once()


@pytest.mark.asyncio
async def test_user_repo_disable(mock_keycloak_client: AsyncMock):
    mock_keycloak_client.get.return_value = VALID_KC_USER
    repo = KeycloakUserRepository(mock_keycloak_client)
    await repo.disable("123")
    mock_keycloak_client.put.assert_awaited_with("/users/123", json={"enabled": False})


# --- Block 3: KeycloakRoleRepository Tests ---
VALID_KC_ROLE = {"id": "role-1", "name": "admin", "description": "desc"}


@pytest.mark.asyncio
async def test_role_repo_find_by_id_success(mock_keycloak_client: AsyncMock):
    mock_keycloak_client.get.return_value = VALID_KC_ROLE
    repo = KeycloakRoleRepository(mock_keycloak_client)
    role = await repo.find_by_id("role-1")
    assert role.id == "role-1"


@pytest.mark.asyncio
async def test_role_repo_find_by_id_not_found_returns_none(
    mock_keycloak_client: AsyncMock,
):
    mock_keycloak_client.get.side_effect = KeycloakAPIError(404, "")
    repo = KeycloakRoleRepository(mock_keycloak_client)
    role = await repo.find_by_id("not-found")
    assert role is None


@pytest.mark.asyncio
async def test_role_repo_create_success(mock_keycloak_client: AsyncMock):
    mock_keycloak_client.get.return_value = VALID_KC_ROLE
    repo = KeycloakRoleRepository(mock_keycloak_client)
    role = await repo.create({"name": "admin", "description": "desc"})
    assert role.id == "role-1"
    mock_keycloak_client.post.assert_awaited_once()


@pytest.mark.asyncio
async def test_role_repo_create_and_refetch_fails(mock_keycloak_client: AsyncMock):
    repo = KeycloakRoleRepository(mock_keycloak_client)
    repo.find_by_name = AsyncMock(return_value=None)
    with pytest.raises(
        KeycloakAPIError, match="Não foi possível recuperar o role recém-criado"
    ):
        await repo.create({"name": "admin"})


@pytest.mark.asyncio
async def test_role_repo_update_success(mock_keycloak_client: AsyncMock):
    repo = KeycloakRoleRepository(mock_keycloak_client)
    role_domain = Role.model_validate(VALID_KC_ROLE)
    repo.find_by_id = AsyncMock(return_value=role_domain)
    updated_role = await repo.update("role-1", {"description": "new desc"})
    assert updated_role.description == "new desc"
    mock_keycloak_client.put.assert_awaited_once()


@pytest.mark.asyncio
async def test_role_repo_delete_success(mock_keycloak_client: AsyncMock):
    repo = KeycloakRoleRepository(mock_keycloak_client)
    result = await repo.delete("role-1")
    assert result is True
    mock_keycloak_client.delete.assert_awaited_once_with("/roles-by-id/role-1")


@pytest.mark.asyncio
async def test_role_repo_add_roles_to_user(mock_keycloak_client: AsyncMock):
    repo = KeycloakRoleRepository(mock_keycloak_client)
    roles = [Role(id="r1", name="n1"), Role(id="r2", name="n2")]
    await repo.add_roles_to_user("user-1", roles)
    mock_keycloak_client.post.assert_awaited_once()


@pytest.mark.asyncio
async def test_role_repo_remove_roles_from_user(mock_keycloak_client: AsyncMock):
    repo = KeycloakRoleRepository(mock_keycloak_client)
    roles = [Role(id="r1", name="n1")]
    await repo.remove_roles_from_user("user-1", roles)
    mock_keycloak_client.delete.assert_awaited_once()


# --- Block of Additional Tests for 100% Coverage ---


@pytest.mark.asyncio
async def test_client_get_admin_token_returns_cached_token(mock_settings):
    """
    Tests that the admin token is returned from cache if it already exists.
    """
    client = KeycloakAdminClient()
    client._admin_token = "cached-admin-token"  # Pre-populate the token

    token = await client._get_admin_token()

    assert token == "cached-admin-token"


@pytest.mark.asyncio
async def test_client_request_token_refresh_fails_raises_error(
    respx_mock: MockRouter, mock_settings
):
    """
    Tests the scenario where the attempt to refresh the token also fails.
    """
    # The first token call works, the second one (for the refresh) fails.
    respx_mock.post(mock_settings.keycloak_token_url).mock(
        side_effect=[
            httpx.Response(200, json={"access_token": "expired-token"}),
            httpx.Response(500, text="Token service down"),
        ]
    )
    users_url = f"{mock_settings.keycloak_admin_api_url}/users"
    # The API call always returns 401 to force the refresh attempt.
    respx_mock.get(users_url).mock(return_value=httpx.Response(401))

    client = KeycloakAdminClient()

    # FIX: The final exception should be the one from the failed token refresh.
    # We capture it to verify the detailed description.
    with pytest.raises(KeycloakAPIError) as exc_info:
        await client.get("/users")
    assert (
        "Erro ao obter token de admin: Token service down" in exc_info.value.description
    )


@pytest.mark.asyncio
async def test_user_repo_find_by_id_raises_unhandled_keycloak_error(
    mock_keycloak_client: AsyncMock,
):
    """
    Tests that an exception other than 404 is re-raised.
    """
    mock_keycloak_client.get.side_effect = KeycloakAPIError(
        500, "Internal Server Error"
    )
    repo = KeycloakUserRepository(mock_keycloak_client)

    with pytest.raises(KeycloakAPIError):
        await repo.find_by_id("some-id")


@pytest.mark.asyncio
async def test_role_repo_find_by_name_raises_unhandled_keycloak_error(
    mock_keycloak_client: AsyncMock,
):
    """
    Tests that an exception other than 404 is re-raised.
    """
    mock_keycloak_client.get.side_effect = KeycloakAPIError(403, "Forbidden")
    repo = KeycloakRoleRepository(mock_keycloak_client)

    with pytest.raises(KeycloakAPIError):
        await repo.find_by_name("some-role")


@pytest.mark.asyncio
async def test_role_repo_update_raises_not_found_first(mock_keycloak_client: AsyncMock):
    """
    Tests the error path where the role is not found before updating.
    """
    repo = KeycloakRoleRepository(mock_keycloak_client)
    repo.find_by_id = AsyncMock(return_value=None)

    with pytest.raises(KeycloakAPIError) as exc_info:
        await repo.update("non-existent-id", {"name": "new-name"})
    assert "Role com ID 'non-existent-id' não encontrado" in exc_info.value.description


@pytest.mark.asyncio
async def test_role_repo_update_raises_generic_exception(
    mock_keycloak_client: AsyncMock,
):
    """
    Tests the capture of a generic exception during the update process.
    """
    repo = KeycloakRoleRepository(mock_keycloak_client)
    repo.find_by_id = AsyncMock(return_value=Role(id="1", name="test"))
    mock_keycloak_client.put.side_effect = Exception("Something went wrong")

    with pytest.raises(KeycloakAPIError) as exc_info:
        await repo.update("role-1", {"name": "new-name"})
    assert "Erro ao atualizar role: Something went wrong" in exc_info.value.description


@pytest.mark.asyncio
async def test_role_repo_find_all_empty(mock_keycloak_client: AsyncMock):
    """Tests find_all when Keycloak returns an empty list."""
    mock_keycloak_client.get.return_value = []
    repo = KeycloakRoleRepository(mock_keycloak_client)
    roles = await repo.find_all()
    assert roles == []
