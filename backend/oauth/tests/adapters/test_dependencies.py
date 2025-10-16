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
from src.adapters.api.dependencies import (
    get_current_user,
    get_jwks,
    get_role_repository,
    get_role_service,
    get_user_repository,
    get_user_service,
    jwks_cache,
)
from src.core.exceptions import InvalidTokenError

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

    from src import adapters, config

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
    
    if "iss" not in payload:
        payload["iss"] = "http://keycloak.test/realms/test-realm"
    if "aud" not in payload:
        payload["aud"] = "test-client"
    if "exp" not in payload:
        payload["exp"] = time.time() + 3600

    return jwt.encode(payload, private_key, algorithm="RS256", headers=headers)


@pytest.mark.asyncio
@patch("src.adapters.api.dependencies.get_jwks")
async def test_get_current_user_success(mock_get_jwks: AsyncMock, mock_settings):
    mock_get_jwks.return_value = mock_jwks
    payload = {"sub": "123"}
    token = create_test_token(payload)
    decoded_payload = await get_current_user(token)
    assert decoded_payload["sub"] == "123"


@pytest.mark.asyncio
@patch("src.adapters.api.dependencies.get_jwks")
async def test_get_current_user_invalid_signature_raises_error(
    mock_get_jwks: AsyncMock, mock_settings
):
    mock_get_jwks.return_value = mock_jwks
    token = create_test_token({"sub": "123"}) + "invalid"
    with pytest.raises(InvalidTokenError) as exc_info:
        await get_current_user(token)
    assert "Invalid crypto padding" in exc_info.value.description


@pytest.mark.asyncio
@patch("src.adapters.api.dependencies.get_jwks")
async def test_get_current_user_invalid_algorithm_raises_error(
    mock_get_jwks: AsyncMock, mock_settings
):
    mock_get_jwks.return_value = mock_jwks
    token = create_test_token(
        {"sub": "123"}, headers={"alg": "HS256", "kid": "test-kid"}
    )
    with pytest.raises(InvalidTokenError) as exc_info:
        await get_current_user(token)
    assert "The specified alg value is not allowed" in exc_info.value.description


@pytest.mark.asyncio
@patch("src.adapters.api.dependencies.get_jwks")
async def test_get_current_user_kid_not_found_raises_error(
    mock_get_jwks: AsyncMock, mock_settings
):
    """Testa que um token com 'kid' não encontrado no JWKS levanta InvalidTokenError."""
    # CORREÇÃO: Fornece um JWKS vazio para garantir que a chave não seja encontrada.
    mock_get_jwks.return_value = {"keys": []}
    token = create_test_token(
        {"sub": "123"}, headers={"alg": "RS256", "kid": "unknown-kid"}
    )
    with pytest.raises(InvalidTokenError) as exc_info:
        await get_current_user(token)
    # CORREÇÃO: O erro real é a falha na verificação da assinatura, pois nenhuma chave foi encontrada.
    assert "Signature verification failed" in exc_info.value.description


# --- Testes para as Factories de Dependência ---


def test_dependency_factories_return_instances():
    """Cobre as funções de factory dos repositórios."""
    assert get_user_service() is not None
    assert get_role_service() is not None
    assert get_user_repository() is not None
    assert get_role_repository() is not None