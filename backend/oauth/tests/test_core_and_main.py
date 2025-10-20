from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from src.core.domain.role import Role
from src.core.domain.user import User
from src.core.exceptions import (
    BaseAPIException,
    ConflictAlreadyExistsError,
    InvalidTokenError,
    KeycloakAPIError,
    NotFoundError,
)
from src.core.services.role_service import RoleService
from src.core.services.user_service import UserService

# Importações da Aplicação
from src.main import app


@pytest.fixture
def mock_user_repo() -> MagicMock:
    """Fixture que cria um mock assíncrono para o IUserRepository."""
    return AsyncMock()


@pytest.fixture
def mock_role_repo() -> MagicMock:
    """Fixture que cria um mock assíncrono para o IRoleRepository."""
    return AsyncMock()


@pytest.fixture
def user_service(mock_user_repo: MagicMock, mock_role_repo: MagicMock) -> UserService:
    """Fixture que injeta os repositórios mockados no UserService."""
    return UserService(user_repo=mock_user_repo, role_repo=mock_role_repo)


@pytest.fixture
def role_service(mock_role_repo: MagicMock) -> RoleService:
    """Fixture que injeta o repositório mockado no RoleService."""
    return RoleService(role_repository=mock_role_repo)


@pytest.fixture(scope="session")
def client() -> TestClient:
    """Cria um cliente de teste para a aplicação FastAPI."""
    return TestClient(app)


# --- Bloco 1: Testes dos Modelos de Domínio (Pydantic) ---


def test_domain_user_creation_success():
    """
    Testa a criação de um User com dados válidos.
    Garante que a validação do Pydantic (EmailStr) funciona.
    """
    user = User(
        id="user-123",
        username="test@example.com",
        first_name="Test",
        last_name="User",
        enabled=True,
    )
    assert user.id == "user-123"
    assert user.username == "test@example.com"
    assert user.first_name == "Test"
    assert user.last_name == "User"
    assert user.enabled is True


def test_domain_user_creation_invalid_email_raises_validation_error():
    """
    Testa que a criação de um User com email inválido levanta ValidationError.
    """
    with pytest.raises(ValidationError):
        User(
            id="user-123",
            username="not-an-email",
            first_name="Test",
            last_name="User",
            enabled=True,
        )


def test_domain_role_creation_success():
    """
    Testa a criação de um Role com todos os campos.
    """
    role = Role(id="role-123", name="admin", description="Administrator Role")
    assert role.id == "role-123"
    assert role.name == "admin"
    assert role.description == "Administrator Role"


def test_domain_role_creation_without_description_success():
    """
    Testa a criação de um Role com o campo opcional 'description' ausente.
    """
    role = Role(id="role-456", name="editor")
    assert role.id == "role-456"
    assert role.name == "editor"
    assert role.description is None


# --- Bloco 2: Testes para Exceções Customizadas ---


def test_base_api_exception_initialization():
    """Garante que a exceção base é instanciada corretamente."""
    exc = BaseAPIException(description="Custom Description", error_stack=["trace"])
    assert exc.description == "Custom Description"
    assert exc.error_stack == ["trace"]


def test_keycloak_api_error_initialization():
    """Garante que a exceção de API do Keycloak formata o error_code."""
    exc = KeycloakAPIError(status_code=418, description="I'm a teapot")
    assert exc.status_code == 418
    assert exc.error_code == "OA-418"
    assert exc.description == "I'm a teapot"


def test_invalid_token_error_instantiation():
    """Garante a cobertura da exceção de token inválido."""
    exc = InvalidTokenError()
    assert exc.status_code == 401
    assert exc.description == "Access token inválido"


# --- Bloco 3: Testes de Serviço (UserService) ---


@pytest.mark.asyncio
async def test_user_service_create_user(
    user_service: UserService, mock_user_repo: MagicMock
):
    """Testa o repasse da criação de usuário para o repositório."""
    user_data = {"username": "new@test.com"}
    await user_service.create_user(user_data)
    mock_user_repo.create.assert_awaited_once_with(user_data)


@pytest.mark.asyncio
async def test_user_service_find_all(
    user_service: UserService, mock_user_repo: MagicMock
):
    """Testa o repasse da busca de todos os usuários."""
    await user_service.find_all(enabled=True)
    mock_user_repo.find_all.assert_awaited_once_with(True)


@pytest.mark.asyncio
async def test_user_service_find_by_id(
    user_service: UserService, mock_user_repo: MagicMock
):
    """Testa o repasse da busca de usuário por ID."""
    await user_service.find_by_id("user-1")
    mock_user_repo.find_by_id.assert_awaited_once_with("user-1")


@pytest.mark.asyncio
async def test_user_service_update_user(
    user_service: UserService, mock_user_repo: MagicMock
):
    """Testa o repasse da atualização de usuário."""
    update_data = {"first_name": "John"}
    await user_service.update_user("user-1", update_data)
    mock_user_repo.update.assert_awaited_once_with("user-1", update_data)


@pytest.mark.asyncio
async def test_user_service_reset_password(
    user_service: UserService, mock_user_repo: MagicMock
):
    """Testa o repasse do reset de senha."""
    await user_service.reset_password("user-1", "new_password")
    mock_user_repo.reset_password.assert_awaited_once_with("user-1", "new_password")


@pytest.mark.asyncio
async def test_user_service_disable_user(
    user_service: UserService, mock_user_repo: MagicMock
):
    """Testa o repasse da desativação de usuário."""
    await user_service.disable_user("user-1")
    mock_user_repo.disable.assert_awaited_once_with("user-1")


@pytest.mark.asyncio
async def test_user_service_assign_role_to_user_success(
    user_service: UserService, mock_user_repo: MagicMock, mock_role_repo: MagicMock
):
    """Testa a atribuição de um role a um usuário com sucesso."""
    mock_user_repo.find_by_id.return_value = "some_user"
    mock_role = Role(id="role-1", name="admin")
    mock_role_repo.find_by_name.return_value = mock_role

    await user_service.assign_role_to_user("user-1", "admin")

    mock_user_repo.find_by_id.assert_awaited_once_with("user-1")
    mock_role_repo.find_by_name.assert_awaited_once_with("admin")
    mock_role_repo.add_to_user.assert_awaited_once_with("user-1", [mock_role])


@pytest.mark.asyncio
async def test_user_service_assign_role_to_user_role_not_found_raises_error(
    user_service: UserService, mock_user_repo: MagicMock, mock_role_repo: MagicMock
):
    """Testa que a atribuição falha com NotFoundError se o role não existe."""
    mock_user_repo.find_by_id.return_value = "some_user"
    mock_role_repo.find_by_name.return_value = None  # Simula role não encontrado

    with pytest.raises(NotFoundError):
        await user_service.assign_role_to_user("user-1", "non_existent_role")

    mock_role_repo.add_to_user.assert_not_awaited()


@pytest.mark.asyncio
async def test_user_service_remove_role_from_user_success(
    user_service: UserService, mock_user_repo: MagicMock, mock_role_repo: MagicMock
):
    """Testa a remoção de um role de um usuário com sucesso."""
    mock_user_repo.find_by_id.return_value = "some_user"
    mock_role = Role(id="role-1", name="admin")
    mock_role_repo.find_by_name.return_value = mock_role

    await user_service.remove_role_from_user("user-1", "admin")

    mock_user_repo.find_by_id.assert_awaited_once_with("user-1")
    mock_role_repo.find_by_name.assert_awaited_once_with("admin")
    mock_role_repo.remove_from_user.assert_awaited_once_with("user-1", [mock_role])


@pytest.mark.asyncio
async def test_user_service_remove_role_from_user_role_not_found_raises_error(
    user_service: UserService, mock_user_repo: MagicMock, mock_role_repo: MagicMock
):
    """Testa que a remoção falha com NotFoundError se o role não existe."""
    mock_user_repo.find_by_id.return_value = "some_user"
    mock_role_repo.find_by_name.return_value = None

    with pytest.raises(NotFoundError):
        await user_service.remove_role_from_user("user-1", "non_existent_role")

    mock_role_repo.remove_from_user.assert_not_awaited()


# --- Bloco 4: Testes de Serviço (RoleService) ---


@pytest.mark.asyncio
async def test_role_service_create_role_success(
    role_service: RoleService, mock_role_repo: MagicMock
):
    """Testa a criação de role bem-sucedida quando o nome não existe."""
    role_data = {"name": "new-role"}
    mock_role_repo.find_by_name.return_value = None
    await role_service.create_role(role_data)
    mock_role_repo.create.assert_awaited_once_with(role_data)


@pytest.mark.asyncio
async def test_role_service_create_role_conflict_raises_error(
    role_service: RoleService, mock_role_repo: MagicMock
):
    """Testa que a criação de role com nome duplicado levanta ConflictAlreadyExistsError."""
    role_data = {"name": "existing-role"}
    mock_role_repo.find_by_name.return_value = "existing"
    with pytest.raises(ConflictAlreadyExistsError):
        await role_service.create_role(role_data)
    mock_role_repo.create.assert_not_awaited()


@pytest.mark.asyncio
async def test_role_service_get_all_roles(
    role_service: RoleService, mock_role_repo: MagicMock
):
    """Testa o repasse da busca por todos os roles."""
    await role_service.get_all_roles()
    mock_role_repo.find_all.assert_awaited_once()


@pytest.mark.asyncio
async def test_role_service_get_role_by_id_success(
    role_service: RoleService, mock_role_repo: MagicMock
):
    """Testa a busca por ID bem-sucedida."""
    mock_role_repo.find_by_id.return_value = "found_role"
    role = await role_service.get_role_by_id("role-1")
    assert role == "found_role"


@pytest.mark.asyncio
async def test_role_service_get_role_by_id_not_found_raises_error(
    role_service: RoleService, mock_role_repo: MagicMock
):
    """Testa que a busca por ID inexistente levanta NotFoundError."""
    mock_role_repo.find_by_id.return_value = None
    with pytest.raises(NotFoundError):
        await role_service.get_role_by_id("not-found-id")


@pytest.mark.asyncio
async def test_role_service_update_role_success(
    role_service: RoleService, mock_role_repo: MagicMock
):
    """Testa a atualização completa de um role com sucesso."""
    role_data = {"name": "new-name"}
    mock_role_repo.find_by_id.return_value = Role(id="role-1", name="old-name")
    mock_role_repo.update.return_value = Role(id="role-1", name="new-name")

    updated_role = await role_service.update_role("role-1", role_data)

    mock_role_repo.update.assert_awaited_once_with("role-1", role_data)
    assert updated_role.name == "new-name"


@pytest.mark.asyncio
async def test_role_service_update_role_not_found_on_update_raises_error(
    role_service: RoleService, mock_role_repo: MagicMock
):
    """Testa que se o repositório falhar em atualizar, levanta NotFoundError."""
    mock_role_repo.find_by_id.return_value = "found_role"
    mock_role_repo.update.return_value = None  # Simula falha na atualização
    with pytest.raises(NotFoundError):
        await role_service.update_role("role-1", {"name": "new-name"})


@pytest.mark.asyncio
async def test_role_service_partial_update_role_filters_none_values(
    role_service: RoleService, mock_role_repo: MagicMock
):
    """Testa que a atualização parcial filtra campos nulos."""
    mock_role_repo.find_by_id.return_value = "found_role"
    update_data = {"name": "new-name", "description": None}
    expected_payload = {"name": "new-name"}

    await role_service.partial_update_role("role-1", update_data)

    mock_role_repo.update.assert_awaited_once_with("role-1", expected_payload)


@pytest.mark.asyncio
async def test_role_service_partial_update_role_with_empty_payload(
    role_service: RoleService, mock_role_repo: MagicMock
):
    """Testa que a atualização parcial com payload vazio não chama o update."""
    current_role = Role(id="role-1", name="current")
    mock_role_repo.find_by_id.return_value = current_role
    update_data = {"name": None, "description": None}

    result = await role_service.partial_update_role("role-1", update_data)

    mock_role_repo.update.assert_not_awaited()
    assert result == current_role


@pytest.mark.asyncio
async def test_role_service_partial_update_role_not_found_on_update_raises_error(
    role_service: RoleService, mock_role_repo: MagicMock
):
    """Testa que se o repositório falhar na atualização parcial, levanta NotFoundError."""
    mock_role_repo.find_by_id.return_value = "found_role"
    mock_role_repo.update.return_value = None  # Simula falha
    with pytest.raises(NotFoundError):
        await role_service.partial_update_role("role-1", {"name": "new-name"})


@pytest.mark.asyncio
async def test_role_service_delete_role_success(
    role_service: RoleService, mock_role_repo: MagicMock
):
    """Testa a deleção bem-sucedida de um role."""
    mock_role_repo.find_by_id.return_value = "found_role"
    mock_role_repo.delete.return_value = True
    await role_service.delete_role("role-1")
    mock_role_repo.delete.assert_awaited_once_with("role-1")


@pytest.mark.asyncio
async def test_role_service_delete_role_repo_fails_raises_error(
    role_service: RoleService, mock_role_repo: MagicMock
):
    """Testa que se o repositório falhar na deleção, levanta NotFoundError."""
    mock_role_repo.find_by_id.return_value = "found_role"
    mock_role_repo.delete.return_value = False  # Simula falha na deleção
    with pytest.raises(NotFoundError):
        await role_service.delete_role("role-1")


@pytest.mark.asyncio
async def test_role_service_assign_roles_to_user_success(
    role_service: RoleService, mock_role_repo: MagicMock
):
    """Testa a atribuição de múltiplos roles a um usuário."""
    roles = [Role(id="r1", name="admin"), Role(id="r2", name="editor")]
    mock_role_repo.find_by_id.side_effect = roles

    await role_service.assign_roles_to_user("user-1", ["r1", "r2"])

    mock_role_repo.add_roles_to_user.assert_awaited_once_with("user-1", roles)


@pytest.mark.asyncio
async def test_role_service_assign_roles_to_user_with_empty_list(
    role_service: RoleService, mock_role_repo: MagicMock
):
    """Testa que a atribuição com lista vazia não chama o repositório."""
    await role_service.assign_roles_to_user("user-1", [])
    mock_role_repo.add_roles_to_user.assert_not_awaited()


@pytest.mark.asyncio
async def test_role_service_assign_roles_to_user_not_found_raises_error(
    role_service: RoleService, mock_role_repo: MagicMock
):
    """Testa que a atribuição falha se um dos roles não for encontrado."""
    mock_role_repo.find_by_id.return_value = None
    with pytest.raises(NotFoundError):
        await role_service.assign_roles_to_user("user-1", ["not-found-role"])


@pytest.mark.asyncio
async def test_role_service_remove_roles_from_user_success(
    role_service: RoleService, mock_role_repo: MagicMock
):
    """Testa a remoção de múltiplos roles de um usuário."""
    roles = [Role(id="r1", name="admin"), Role(id="r2", name="editor")]
    mock_role_repo.find_by_id.side_effect = roles

    await role_service.remove_roles_from_user("user-1", ["r1", "r2"])

    mock_role_repo.remove_roles_from_user.assert_awaited_once_with("user-1", roles)


@pytest.mark.asyncio
async def test_role_service_remove_roles_from_user_with_empty_list(
    role_service: RoleService, mock_role_repo: MagicMock
):
    """Testa que a remoção com lista vazia não chama o repositório."""
    await role_service.remove_roles_from_user("user-1", [])
    mock_role_repo.remove_roles_from_user.assert_not_awaited()


# --- Bloco 5: Testes da Aplicação Principal (main.py) ---


def test_main_health_check_returns_ok(client: TestClient):
    """
    Testa a rota GET / para garantir que a API está respondendo.
    """
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
