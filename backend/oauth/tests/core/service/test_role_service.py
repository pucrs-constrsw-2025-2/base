import pytest
from unittest.mock import MagicMock
from oauth_api.core.services.role_service import RoleService
from oauth_api.core.ports.role_repository import IRoleRepository
from oauth_api.core.domain.role import Role
from oauth_api.core.exceptions import RoleAlreadyExistsException

@pytest.fixture
def mock_role_repo() -> MagicMock:
    """Fornece um mock do IRoleRepository."""
    return MagicMock(spec=IRoleRepository)

@pytest.fixture
def role_service(mock_role_repo: MagicMock) -> RoleService:
    """Fornece uma instância do RoleService com um repositório mockado."""
    return RoleService(role_repository=mock_role_repo)

def test_create_role_success(role_service: RoleService, mock_role_repo: MagicMock):
    """
    Valida a criação de uma role com sucesso.
    Importância: Garante que a lógica de negócio para a criação de roles
    funciona corretamente e previne duplicatas.
    """
    # Arrange
    role_data = {"name": "admin", "description": "Administrator Role"}
    expected_role = Role(id="role-123", **role_data)
    
    mock_role_repo.find_by_name.return_value = None
    mock_role_repo.create.return_value = expected_role
    
    # Act
    created_role = role_service.create_role(role_data)
    
    # Assert
    mock_role_repo.find_by_name.assert_called_once_with("admin")
    mock_role_repo.create.assert_called_once_with(role_data)
    assert created_role == expected_role

def test_assign_role_to_user(role_service: RoleService, mock_role_repo: MagicMock):
    """
    Valida a lógica de negócio para atribuir uma role a um usuário.
    Importância: Testa a interação entre domínios (usuário e role), um ponto
    crítico em sistemas de permissão.
    """
    # Arrange
    user_id = "user-1"
    role_id = "role-admin"
    
    # Act
    role_service.assign_role_to_user(user_id, role_id)
    
    # Assert
    mock_role_repo.assign_to_user.assert_called_once_with(user_id, role_id)