# --- CÓDIGO PARA O ARQUIVO: tests/conftest.py ---
# Este arquivo DEVE se chamar conftest.py e ficar na raiz da pasta 'tests/'.

import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock, AsyncMock

# Importa a aplicação principal do FastAPI
from oauth_api.main import app

# Importa os serviços e as funções de dependência que vamos "enganar"
from oauth_api.core.services.user_service import UserService
from oauth_api.core.services.role_service import RoleService
from oauth_api.adapters.api.dependencies import get_user_service, get_role_service, get_current_user

@pytest.fixture(scope="session")
def client() -> TestClient:
    """
    Fixture que cria um cliente de teste para a nossa API.
    O 'scope="session"' faz com que ele seja criado uma vez só para todos os testes.
    """
    yield TestClient(app)

@pytest.fixture
def mock_user_service() -> MagicMock:
    """Fixture que cria um dublê (mock) para o UserService."""
    return AsyncMock(spec=UserService)

@pytest.fixture
def mock_role_service() -> MagicMock:
    """Fixture que cria um dublê (mock) para o RoleService."""
    return AsyncMock(spec=RoleService)

@pytest.fixture(autouse=True)
def override_api_dependencies(mock_user_service: MagicMock, mock_role_service: MagicMock):
    """
    Esta fixture é mágica! O 'autouse=True' faz com que ela rode para TODOS os testes.
    Ela substitui os serviços de verdade e a segurança pelos nossos dublês.
    """
    app.dependency_overrides[get_user_service] = lambda: mock_user_service
    app.dependency_overrides[get_role_service] = lambda: mock_role_service
    # Mock da segurança para não precisar de um token real nos testes de rotas
    app.dependency_overrides[get_current_user] = lambda: {"sub": "user-test-id"}
    yield
    # Limpa os mocks depois que os testes acabam
    app.dependency_overrides.clear()

@pytest.fixture
def mock_settings(monkeypatch):
    """Fixture para mockar as configurações de ambiente para os testes de login."""
    monkeypatch.setenv("KEYCLOAK_SERVER_URL", "http://keycloak.test")
    monkeypatch.setenv("KEYCLOAK_REALM", "test-realm")
    monkeypatch.setenv("KEYCLOAK_CLIENT_ID", "test-client")
    monkeypatch.setenv("KEYCLOAK_CLIENT_SECRET", "a-secret")
    from oauth_api import config
    import importlib
    importlib.reload(config)
    # Garante que a rota de auth use as configurações de teste
    monkeypatch.setattr("oauth_api.adapters.api.routes.auth.settings", config.settings)
    return config.settings


# --- CÓDIGO PARA O ARQUIVO: tests/test_suite_adapters.py ---
# (ou qualquer outro arquivo de teste dentro da pasta 'tests/')

import pytest
import httpx
from respx import MockRouter
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, MagicMock
from pydantic import ValidationError

# Schemas
from oauth_api.adapters.api.schemas.user_schemas import UserCreateRequest
from oauth_api.adapters.api.schemas.role_schemas import RoleCreateRequest

# Domain e Exceptions
from oauth_api.core.domain.user import User
from oauth_api.core.domain.role import Role
from oauth_api.core.exceptions import NotFoundError

# --- Testes para os Schemas ---

def test_user_create_request_success():
    data = {"username": "teste@exemplo.com", "password": "Password123", "firstName": "Teste", "lastName": "Guri"}
    schema = UserCreateRequest(**data)
    assert schema.username == "teste@exemplo.com"
    assert schema.first_name == "Teste"

def test_user_create_request_invalid_email():
    with pytest.raises(ValidationError):
        UserCreateRequest(username="email-invalido", password="Password123", firstName="Teste", lastName="Guri")

# --- Testes para as Rotas ---

VALID_USER_OBJ = User(id="user-123", username="teste@exemplo.com", first_name="Teste", last_name="Guri", enabled=True)
VALID_ROLE_OBJ = Role(id="role-123", name="admin", description="Admin Role")

@pytest.mark.asyncio
async def test_login_success(client: TestClient, respx_mock: MockRouter, mock_settings):
    token_data = {"access_token": "um-token-jwt", "expires_in": 300, "refresh_expires_in": 1800, "refresh_token": "um-refresh-token", "token_type": "Bearer"}
    respx_mock.post(mock_settings.keycloak_token_url).mock(return_value=httpx.Response(201, json=token_data))
    
    login_form_data = {"username": "teste@exemplo.com", "password": "123"}
    response = client.post("/login", data=login_form_data)
    
    assert response.status_code == 201
    assert response.json()["access_token"] == "um-token-jwt"

@pytest.mark.asyncio
async def test_login_invalid_credentials(client: TestClient, respx_mock: MockRouter, mock_settings):
    respx_mock.post(mock_settings.keycloak_token_url).mock(return_value=httpx.Response(401))
    
    login_form_data = {"username": "teste@exemplo.com", "password": "senha-errada"}
    response = client.post("/login", data=login_form_data)
    
    assert response.status_code == 401
    assert response.json()["error_code"] == "OA-401"

def test_create_user_route(client: TestClient, mock_user_service: MagicMock):
    mock_user_service.create_user.return_value = VALID_USER_OBJ
    
    user_payload = {"username": "joao@exemplo.com", "password": "Password123", "firstName": "Joao", "lastName": "Silva"}
    response = client.post("/users", json=user_payload)
    
    assert response.status_code == 201
    assert response.json()["username"] == "teste@exemplo.com"
    mock_user_service.create_user.assert_awaited_once()

def test_get_user_by_id_not_found(client: TestClient, mock_user_service: MagicMock):
    mock_user_service.find_by_id.side_effect = NotFoundError
    
    response = client.get("/users/id-nao-existe")
    
    assert response.status_code == 404
    assert response.json()["error_code"] == "OA-404"

def test_delete_user_route(client: TestClient, mock_user_service: MagicMock):
    response = client.delete("/users/user-123")
    
    assert response.status_code == 204
    mock_user_service.disable_user.assert_awaited_once_with("user-123")

def test_assign_roles_to_user_route(client: TestClient, mock_role_service: MagicMock):
    payload = {"role_ids": ["role-1", "role-2"]}
    response = client.post("/users/user-123/roles", json=payload)
    
    assert response.status_code == 204
    mock_role_service.assign_roles_to_user.assert_awaited_once_with("user-123", ["role-1", "role-2"])

def test_get_all_roles_route(client: TestClient, mock_role_service: MagicMock):
    mock_role_service.get_all_roles.return_value = [VALID_ROLE_OBJ]
    
    response = client.get("/roles")
    
    assert response.status_code == 200
    assert len(response.json()) == 1
    assert response.json()[0]["name"] == "admin"

def test_partial_update_role_route(client: TestClient, mock_role_service: MagicMock):
    mock_role_service.partial_update_role.return_value = VALID_ROLE_OBJ
    
    payload = {"description": "Nova Descrição"}
    response = client.patch("/roles/role-123", json=payload)
    
    assert response.status_code == 200
    mock_role_service.partial_update_role.assert_awaited_once_with("role-123", payload)
