# --- tests/adapters/test_dependencies.py ---

import time
from unittest.mock import AsyncMock, patch

import httpx
import pytest
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.asymmetric import rsa
from jose import jwt
from jose.utils import base64url_encode
from respx import MockRouter

# Módulos a serem testados
from oauth_api.adapters.api.dependencies import (
    get_current_user,
    get_jwks,
    get_role_repository,
    get_role_service,
    get_user_repository,
    get_user_service,
    jwks_cache,
)
from oauth_api.core.exceptions import InvalidTokenError

# --- Setup para Geração de Chaves e Tokens Falsos ---
private_key = rsa.generate_private_key(
    public_exponent=65537, key_size=2048, backend=default_backend()
)
public_key = private_key.public_key()
public_numbers = public_key.public_numbers()
e_int = public_numbers.e
n_int = public_numbers.n
e_bytes = e_int.to_bytes((e_int.bit_length() + 7) // 8, "big")
n_bytes = n_int.to_bytes((n_int.bit_length() + 7) // 8, "big")

jwk = {
    "kty": "RSA",
    "kid": "test-kid",
    "use": "sig",
    "alg": "RS256",
    "n": base64url_encode(n_bytes).decode("utf-8"),
    "e": base64url_encode(e_bytes).decode("utf-8"),
}
mock_jwks = {"keys": [jwk]}


@pytest.fixture(autouse=True)
def clear_cache():
    jwks_cache.clear()
    yield


@pytest.fixture
def mock_settings(monkeypatch):
    monkeypatch.setenv("KEYCLOAK_SERVER_URL", "http://keycloak.test")
    monkeypatch.setenv("KEYCLOAK_REALM", "test-realm")
    monkeypatch.setenv("KEYCLOAK_CLIENT_ID", "test-client")
    monkeypatch.setenv("KEYCLOAK_TOKEN_ALGORITHM", "RS256")
    monkeypatch.setenv("KEYCLOAK_JWKS_URL", "http://keycloak.test/jwks")

    import importlib

    from oauth_api import adapters, config

    importlib.reload(config)
    monkeypatch.setattr(adapters.api.dependencies, "settings", config.settings)
    return config.settings


# --- Testes para get_jwks ---


@pytest.mark.asyncio
async def test_get_jwks_fetches_and_caches(respx_mock: MockRouter, mock_settings):
    jwks_route = respx_mock.get(mock_settings.keycloak_jwks_url).mock(
        return_value=httpx.Response(200, json=mock_jwks)
    )
    keys = await get_jwks()
    assert keys == mock_jwks
    assert jwks_route.call_count == 1
    keys_cached = await get_jwks()
    assert keys_cached == mock_jwks
    assert jwks_route.call_count == 1


@pytest.mark.asyncio
async def test_get_jwks_uses_prepopulated_cache(respx_mock: MockRouter, mock_settings):
    """NOVO: Testa a leitura do cache quando ele já está populado."""
    jwks_cache["jwks"] = mock_jwks
    jwks_route = respx_mock.get(mock_settings.keycloak_jwks_url).mock(
        return_value=httpx.Response(500)
    )
    keys = await get_jwks()
    assert keys == mock_jwks
    assert jwks_route.call_count == 0


@pytest.mark.asyncio
async def test_get_jwks_fetch_error_raises_exception(
    respx_mock: MockRouter, mock_settings
):
    respx_mock.get(mock_settings.keycloak_jwks_url).mock(
        return_value=httpx.Response(500)
    )
    with pytest.raises(httpx.HTTPStatusError):
        await get_jwks()


# --- Testes para get_current_user ---


def create_test_token(payload, headers=None):
    if headers is None:
        headers = {"alg": "RS256", "kid": "test-kid"}
    return jwt.encode(payload, private_key, algorithm="RS256", headers=headers)


@pytest.mark.asyncio
@patch("oauth_api.adapters.api.dependencies.get_jwks")
async def test_get_current_user_success(mock_get_jwks: AsyncMock, mock_settings):
    mock_get_jwks.return_value = mock_jwks
    payload = {
        "sub": "123",
        "aud": "test-client",
        "iss": "http://keycloak.test/realms/test-realm",
        "exp": time.time() + 3600,
    }
    token = create_test_token(payload)
    decoded_payload = await get_current_user(token)
    assert decoded_payload["sub"] == "123"


@pytest.mark.asyncio
@patch("oauth_api.adapters.api.dependencies.get_jwks")
async def test_get_current_user_invalid_signature_raises_error(
    mock_get_jwks: AsyncMock, mock_settings
):
    mock_get_jwks.return_value = mock_jwks
    token = create_test_token({"sub": "123"}) + "invalid"
    with pytest.raises(InvalidTokenError) as exc_info:
        await get_current_user(token)
    assert "Error decoding token headers" in exc_info.value.description


@pytest.mark.asyncio
@patch("oauth_api.adapters.api.dependencies.get_jwks")
async def test_get_current_user_invalid_algorithm_raises_error(
    mock_get_jwks: AsyncMock, mock_settings
):
    mock_get_jwks.return_value = mock_jwks
    token = create_test_token(
        {"sub": "123"}, headers={"alg": "HS256", "kid": "test-kid"}
    )
    with pytest.raises(InvalidTokenError) as exc_info:
        await get_current_user(token)
    assert exc_info.value.description == "Algoritmo do token é inválido."


@pytest.mark.asyncio
@patch("oauth_api.adapters.api.dependencies.get_jwks")
async def test_get_current_user_kid_not_found_raises_error(
    mock_get_jwks: AsyncMock, mock_settings
):
    mock_get_jwks.return_value = mock_jwks
    token = create_test_token(
        {"sub": "123"}, headers={"alg": "RS256", "kid": "unknown-kid"}
    )
    with pytest.raises(InvalidTokenError) as exc_info:
        await get_current_user(token)
    assert exc_info.value.description == "Chave pública (kid) não encontrada no JWKS."


# --- Testes para as Factories de Dependência ---


def test_dependency_factories_return_instances():
    """NOVO: Cobre as funções de factory dos repositórios."""
    assert get_user_service() is not None
    assert get_role_service() is not None
    assert get_user_repository() is not None
    assert get_role_repository() is not None


# CORREÇÃO: Adicionar 'patch' à lista de importações
from unittest.mock import AsyncMock, patch

import pytest
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.asymmetric import rsa
from jose.utils import base64url_encode
from respx import MockRouter

# Módulos a serem testados

# --- Setup para Geração de Chaves e Tokens Falsos ---
private_key = rsa.generate_private_key(
    public_exponent=65537, key_size=2048, backend=default_backend()
)
public_key = private_key.public_key()
public_numbers = public_key.public_numbers()
e_int = public_numbers.e
n_int = public_numbers.n
e_bytes = e_int.to_bytes((e_int.bit_length() + 7) // 8, "big")
n_bytes = n_int.to_bytes((n_int.bit_length() + 7) // 8, "big")

jwk = {
    "kty": "RSA",
    "kid": "test-kid",
    "use": "sig",
    "alg": "RS256",
    "n": base64url_encode(n_bytes).decode("utf-8"),
    "e": base64url_encode(e_bytes).decode("utf-8"),
}
mock_jwks = {"keys": [jwk]}


@pytest.fixture(autouse=True)
def clear_cache():
    """Limpa o cache antes de cada teste para garantir isolamento."""
    jwks_cache.clear()
    yield


@pytest.fixture
def mock_settings(monkeypatch):
    """Mocks settings relevantes para a validação do token."""
    monkeypatch.setenv("KEYCLOAK_SERVER_URL", "http://keycloak.test")
    monkeypatch.setenv("KEYCLOAK_REALM", "test-realm")
    monkeypatch.setenv("KEYCLOAK_CLIENT_ID", "test-client")
    monkeypatch.setenv("KEYCLOAK_TOKEN_ALGORITHM", "RS256")
    monkeypatch.setenv("KEYCLOAK_JWKS_URL", "http://keycloak.test/jwks")

    import importlib

    from oauth_api import adapters, config

    importlib.reload(config)
    monkeypatch.setattr(adapters.api.dependencies, "settings", config.settings)
    return config.settings


# --- Testes para get_jwks ---


@pytest.mark.asyncio
async def test_get_jwks_fetches_and_caches(respx_mock: MockRouter, mock_settings):
    """Testa se get_jwks busca as chaves na primeira chamada e usa o cache na segunda."""
    jwks_route = respx_mock.get(mock_settings.keycloak_jwks_url).mock(
        return_value=httpx.Response(200, json=mock_jwks)
    )

    # Primeira chamada: deve buscar via HTTP
    keys = await get_jwks()
    assert keys == mock_jwks
    assert jwks_route.call_count == 1

    # Segunda chamada: deve usar o cache
    keys_cached = await get_jwks()
    assert keys_cached == mock_jwks
    # O contador não deve incrementar
    assert jwks_route.call_count == 1


@pytest.mark.asyncio
async def test_get_jwks_fetch_error_raises_exception(
    respx_mock: MockRouter, mock_settings
):
    """Testa que um erro HTTP ao buscar as chaves levanta uma exceção."""
    respx_mock.get(mock_settings.keycloak_jwks_url).mock(
        return_value=httpx.Response(500)
    )

    with pytest.raises(httpx.HTTPStatusError):
        await get_jwks()


# --- Testes para get_current_user ---


def create_test_token(payload, headers=None):
    """Função auxiliar para criar um token JWT assinado com a chave de teste."""
    if headers is None:
        headers = {"alg": "RS256", "kid": "test-kid"}
    return jwt.encode(payload, private_key, algorithm="RS256", headers=headers)


@pytest.mark.asyncio
@patch("oauth_api.adapters.api.dependencies.get_jwks")
async def test_get_current_user_success(mock_get_jwks: AsyncMock, mock_settings):
    """Testa a validação de um token JWT válido."""
    mock_get_jwks.return_value = mock_jwks
    payload = {
        "sub": "123",
        "aud": "test-client",
        "iss": "http://keycloak.test/realms/test-realm",
        "exp": time.time() + 3600,
    }
    token = create_test_token(payload)
    decoded_payload = await get_current_user(token)
    assert decoded_payload["sub"] == "123"


@pytest.mark.asyncio
@patch("oauth_api.adapters.api.dependencies.get_jwks")
async def test_get_current_user_invalid_signature_raises_error(
    mock_get_jwks: AsyncMock, mock_settings
):
    """Testa que um token com assinatura inválida levanta InvalidTokenError."""
    mock_get_jwks.return_value = mock_jwks
    token = create_test_token({"sub": "123"}) + "invalid"
    with pytest.raises(InvalidTokenError) as exc_info:
        await get_current_user(token)
    assert "Error decoding token headers" in exc_info.value.description


@pytest.mark.asyncio
@patch("oauth_api.adapters.api.dependencies.get_jwks")
async def test_get_current_user_invalid_algorithm_raises_error(
    mock_get_jwks: AsyncMock, mock_settings
):
    """Testa que um token com algoritmo inválido no header levanta InvalidTokenError."""
    mock_get_jwks.return_value = mock_jwks
    token = create_test_token(
        {"sub": "123"}, headers={"alg": "HS256", "kid": "test-kid"}
    )
    with pytest.raises(InvalidTokenError) as exc_info:
        await get_current_user(token)
    assert exc_info.value.description == "Algoritmo do token é inválido."


@pytest.mark.asyncio
@patch("oauth_api.adapters.api.dependencies.get_jwks")
async def test_get_current_user_kid_not_found_raises_error(
    mock_get_jwks: AsyncMock, mock_settings
):
    """Testa que um token com 'kid' não encontrado no JWKS levanta InvalidTokenError."""
    mock_get_jwks.return_value = mock_jwks
    token = create_test_token(
        {"sub": "123"}, headers={"alg": "RS256", "kid": "unknown-kid"}
    )
    with pytest.raises(InvalidTokenError) as exc_info:
        await get_current_user(token)
    assert exc_info.value.description == "Chave pública (kid) não encontrada no JWKS."


# --- Testes para as Factories de Dependência ---


def test_dependency_factories_return_instances():
    """Garante que as funções de injeção de dependência retornam instâncias."""
    assert get_user_service() is not None
    assert get_role_service() is not None
