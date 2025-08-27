# --- tests/test_unit/core/domain/test_domain_models.py ---

import pytest
from pydantic import ValidationError
from oauth_api.core.domain.user import User
from oauth_api.core.domain.role import Role

def test_user_domain_creation_success():
    """
    Testa a criação bem-sucedida de um modelo de domínio User com dados válidos.
    """
    user = User(
        id="user-123",
        username="test@example.com",
        first_name="Test",
        last_name="User",
        enabled=True
    )
    assert user.id == "user-123"
    assert user.username == "test@example.com"
    assert user.enabled is True

def test_user_domain_invalid_email():
    """
    Testa que a criação do modelo User falha com um e-mail inválido,
    levantando uma exceção de validação do Pydantic.
    """
    with pytest.raises(ValidationError):
        User(
            id="user-123",
            username="not-an-email",
            first_name="Test",
            last_name="User",
            enabled=True
        )

def test_role_domain_creation_success():
    """
    Testa a criação bem-sucedida de um modelo de domínio Role com todos os campos.
    """
    role = Role(id="role-123", name="admin", description="Administrator Role")
    assert role.id == "role-123"
    assert role.name == "admin"
    assert role.description == "Administrator Role"

def test_role_domain_creation_without_description():
    """
    Testa a criação bem-sucedida de um Role sem o campo opcional 'description'.
    """
    role = Role(id="role-456", name="editor")
    assert role.id == "role-456"
    assert role.name == "editor"
    assert role.description is None

# --- tests/test_unit/core/services/test_user_service.py ---

import pytest
from unittest.mock import AsyncMock
from oauth_api.core.services.user_service import UserService
from oauth_api.core.exceptions import NotFoundError

@pytest.fixture
def mock_user_repo():
    """Fornece um mock para IUserRepository."""
    return AsyncMock()

@pytest.fixture
def mock_role_repo():
    """Fornece um mock para IRoleRepository."""
    return AsyncMock()

@pytest.fixture
def user_service(mock_user_repo, mock_role_repo):
    """Fornece uma instância de UserService com repositórios mockados."""
    return UserService(user_repo=mock_user_repo, role_repo=mock_role_repo)

@pytest.mark.asyncio
async def test_create_user(user_service, mock_user_repo):
    user_data = {"username": "new@test.com"}
    await user_service.create_user(user_data)
    mock_user_repo.create.assert_awaited_once_with(user_data)

@pytest.mark.asyncio
async def test_find_all_users(user_service, mock_user_repo):
    await user_service.find_all(enabled=True)
    # CORREÇÃO AQUI: Verificando a chamada com argumento posicional
    mock_user_repo.find_all.assert_awaited_once_with(True)

@pytest.mark.asyncio
async def test_find_user_by_id(user_service, mock_user_repo):
    await user_service.find_by_id("user-1")
    mock_user_repo.find_by_id.assert_awaited_once_with("user-1")

@pytest.mark.asyncio
async def test_update_user(user_service, mock_user_repo):
    update_data = {"first_name": "John"}
    await user_service.update_user("user-1", update_data)
    mock_user_repo.update.assert_awaited_once_with("user-1", update_data)

@pytest.mark.asyncio
async def test_reset_password(user_service, mock_user_repo):
    await user_service.reset_password("user-1", "new_password")
    mock_user_repo.reset_password.assert_awaited_once_with("user-1", "new_password")

@pytest.mark.asyncio
async def test_disable_user(user_service, mock_user_repo):
    await user_service.disable_user("user-1")
    mock_user_repo.disable.assert_awaited_once_with("user-1")

@pytest.mark.asyncio
async def test_assign_role_to_user_success(user_service, mock_user_repo, mock_role_repo):
    mock_user_repo.find_by_id.return_value = "some_user"
    mock_role_repo.find_by_name.return_value = "some_role"
    
    await user_service.assign_role_to_user("user-1", "admin")
    
    mock_user_repo.find_by_id.assert_awaited_once_with("user-1")
    mock_role_repo.find_by_name.assert_awaited_once_with("admin")
    mock_role_repo.add_to_user.assert_awaited_once()

@pytest.mark.asyncio
async def test_assign_role_to_user_role_not_found(user_service, mock_user_repo, mock_role_repo):
    mock_user_repo.find_by_id.return_value = "some_user"
    mock_role_repo.find_by_name.return_value = None  # Simula que o role não foi encontrado
    
    with pytest.raises(NotFoundError):
        await user_service.assign_role_to_user("user-1", "non_existent_role")
    
    mock_role_repo.add_to_user.assert_not_awaited()

@pytest.mark.asyncio
async def test_remove_role_from_user_success(user_service, mock_user_repo, mock_role_repo):
    mock_user_repo.find_by_id.return_value = "some_user"
    mock_role_repo.find_by_name.return_value = "some_role"

    await user_service.remove_role_from_user("user-1", "admin")

    mock_user_repo.find_by_id.assert_awaited_once_with("user-1")
    mock_role_repo.find_by_name.assert_awaited_once_with("admin")
    mock_role_repo.remove_from_user.assert_awaited_once()

# --- tests/test_unit/core/services/test_role_service.py ---

import pytest
from unittest.mock import AsyncMock
from oauth_api.core.services.role_service import RoleService
from oauth_api.core.exceptions import ConflictAlreadyExistsError, NotFoundError

@pytest.fixture
def mock_role_repo_for_service():
    """Fornece um mock para IRoleRepository."""
    return AsyncMock()

@pytest.fixture
def role_service(mock_role_repo_for_service):
    """Fornece uma instância de RoleService com um repositório mockado."""
    return RoleService(role_repository=mock_role_repo_for_service)

@pytest.mark.asyncio
async def test_create_role_success(role_service, mock_role_repo_for_service):
    role_data = {"name": "new-role"}
    mock_role_repo_for_service.find_by_name.return_value = None
    await role_service.create_role(role_data)
    mock_role_repo_for_service.create.assert_awaited_once_with(role_data)

@pytest.mark.asyncio
async def test_create_role_conflict(role_service, mock_role_repo_for_service):
    role_data = {"name": "existing-role"}
    mock_role_repo_for_service.find_by_name.return_value = "existing"
    with pytest.raises(ConflictAlreadyExistsError):
        await role_service.create_role(role_data)
    mock_role_repo_for_service.create.assert_not_awaited()

@pytest.mark.asyncio
async def test_get_all_roles(role_service, mock_role_repo_for_service):
    await role_service.get_all_roles()
    mock_role_repo_for_service.find_all.assert_awaited_once()

@pytest.mark.asyncio
async def test_get_role_by_id_success(role_service, mock_role_repo_for_service):
    mock_role_repo_for_service.find_by_id.return_value = "found_role"
    role = await role_service.get_role_by_id("role-1")
    assert role == "found_role"

@pytest.mark.asyncio
async def test_get_role_by_id_not_found(role_service, mock_role_repo_for_service):
    mock_role_repo_for_service.find_by_id.return_value = None
    with pytest.raises(NotFoundError):
        await role_service.get_role_by_id("not-found-id")

@pytest.mark.asyncio
async def test_delete_role_success(role_service, mock_role_repo_for_service):
    mock_role_repo_for_service.find_by_id.return_value = "found_role"
    mock_role_repo_for_service.delete.return_value = True
    await role_service.delete_role("role-1")
    mock_role_repo_for_service.delete.assert_awaited_once_with("role-1")

@pytest.mark.asyncio
async def test_delete_role_repo_fails(role_service, mock_role_repo_for_service):
    mock_role_repo_for_service.find_by_id.return_value = "found_role"
    mock_role_repo_for_service.delete.return_value = False  # Simula falha na deleção
    with pytest.raises(NotFoundError):
        await role_service.delete_role("role-1")

@pytest.mark.asyncio
async def test_update_role_not_found_on_update(role_service, mock_role_repo_for_service):
    mock_role_repo_for_service.find_by_id.return_value = "found_role"
    mock_role_repo_for_service.update.return_value = None  # Simula que o update não retornou nada
    with pytest.raises(NotFoundError):
        await role_service.update_role("role-1", {"name": "new-name"})

@pytest.mark.asyncio
async def test_partial_update_role_filters_none_values(role_service, mock_role_repo_for_service):
    mock_role_repo_for_service.find_by_id.return_value = "found_role"
    update_data = {"name": "new-name", "description": None}
    expected_payload = {"name": "new-name"} # 'description' deve ser filtrado
    await role_service.partial_update_role("role-1", update_data)
    mock_role_repo_for_service.update.assert_awaited_once_with("role-1", expected_payload)

@pytest.mark.asyncio
async def test_partial_update_role_with_empty_payload(role_service, mock_role_repo_for_service):
    mock_role_repo_for_service.find_by_id.return_value = "current_role"
    update_data = {"name": None, "description": None}
    result = await role_service.partial_update_role("role-1", update_data)
    mock_role_repo_for_service.update.assert_not_awaited()
    assert result == "current_role" # Deve retornar o role atual sem tentar atualizar
