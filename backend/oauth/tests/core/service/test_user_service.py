import pytest
from unittest.mock import MagicMock
from oauth_api.core.services.user_service import UserService
from oauth_api.core.ports.user_repository import IUserRepository
from oauth_api.core.domain.user import User
from oauth_api.core.exceptions import UserNotFoundError, UserAlreadyExistsException

# Fixture do Pytest para criar uma instância limpa do mock do repositório para cada teste
@pytest.fixture
def mock_user_repo() -> MagicMock:
    """Fornece um mock do IUserRepository."""
    return MagicMock(spec=IUserRepository)

# Fixture para criar uma instância do serviço com o repositório mockado
@pytest.fixture
def user_service(mock_user_repo: MagicMock) -> UserService:
    """Fornece uma instância do UserService com um repositório mockado."""
    return UserService(user_repository=mock_user_repo)

# --- Início dos Casos de Teste ---

def test_create_user_success(user_service: UserService, mock_user_repo: MagicMock):
    """
    Valida a criação de um usuário com sucesso.
    Importância: Garante que o fluxo principal de criação de usuário está funcionando
    e que o serviço repassa corretamente os dados para a camada de persistência.
    """
    # Arrange (Organizar)
    user_data = {"username": "testuser", "email": "test@example.com", "password": "password123"}
    expected_user = User(id="user-123", **user_data)
    
    # Configura o mock para simular que o email não existe e a criação é bem-sucedida
    mock_user_repo.find_by_email.return_value = None
    mock_user_repo.create.return_value = expected_user
    
    # Act (Agir)
    created_user = user_service.create_user(user_data)
    
    # Assert (Verificar)
    mock_user_repo.find_by_email.assert_called_once_with("test@example.com")
    mock_user_repo.create.assert_called_once_with(user_data)
    assert created_user == expected_user

def test_create_user_already_exists(user_service: UserService, mock_user_repo: MagicMock):
    """
    Valida que uma exceção é levantada ao tentar criar um usuário que já existe.
    Importância: Testa a lógica de negócio para prevenir duplicidade de usuários,
    um requisito crítico de segurança e integridade de dados.
    """
    # Arrange
    user_data = {"username": "existinguser", "email": "exists@example.com", "password": "password123"}
    existing_user = User(id="user-456", **user_data)
    
    # Simula que o usuário com este email já foi encontrado
    mock_user_repo.find_by_email.return_value = existing_user
    
    # Act & Assert
    with pytest.raises(UserAlreadyExistsException) as exc_info:
        user_service.create_user(user_data)
        
    assert "User with email exists@example.com already exists" in str(exc_info.value)
    mock_user_repo.create.assert_not_called() # Garante que o método create não foi chamado

def test_find_user_by_id_success(user_service: UserService, mock_user_repo: MagicMock):
    """
    Valida a busca de um usuário existente pelo seu ID.
    Importância: Cobre o cenário de sucesso para a funcionalidade de leitura de dados.
    """
    # Arrange
    user_id = "user-123"
    expected_user = User(id=user_id, username="testuser", email="test@example.com")
    mock_user_repo.find_by_id.return_value = expected_user
    
    # Act
    found_user = user_service.find_user_by_id(user_id)
    
    # Assert
    mock_user_repo.find_by_id.assert_called_once_with(user_id)
    assert found_user == expected_user

def test_find_user_by_id_not_found(user_service: UserService, mock_user_repo: MagicMock):
    """
    Valida que uma exceção é levantada ao buscar um usuário com ID inexistente.
    Importância: Garante que o sistema lida corretamente com casos de borda,
    como a não localização de um recurso, tratando o erro de forma esperada.
    """
    # Arrange
    user_id = "non-existent-id"
    mock_user_repo.find_by_id.return_value = None # Simula que o repositório não encontrou o usuário
    
    # Act & Assert
    with pytest.raises(UserNotFoundError):
        user_service.find_user_by_id(user_id)
        
    mock_user_repo.find_by_id.assert_called_once_with(user_id)

def test_update_user_success(user_service: UserService, mock_user_repo: MagicMock):
    """
    Valida a atualização dos dados de um usuário com sucesso.
    Importância: Garante que o serviço pode modificar um usuário existente,
    um fluxo fundamental do CRUD.
    """
    # Arrange
    user_id = "user-to-update"
    update_data = {"firstName": "Test", "lastName": "User Updated"}
    
    # Simula que o usuário existe e o repositório o retorna
    existing_user = User(id=user_id, username="testuser", email="test@example.com")
    mock_user_repo.find_by_id.return_value = existing_user
    
    # Act
    user_service.update_user(user_id, update_data)
    
    # Assert
    mock_user_repo.find_by_id.assert_called_once_with(user_id)
    mock_user_repo.update.assert_called_once_with(user_id, update_data)

def test_update_user_not_found(user_service: UserService, mock_user_repo: MagicMock):
    """
    Valida que uma exceção é levantada ao tentar atualizar um usuário inexistente.
    Importância: Testa o tratamento de erro para um caso de borda comum,
    prevenindo operações em registros que não existem.
    """
    # Arrange
    user_id = "non-existent-id"
    update_data = {"firstName": "Test"}
    
    # Simula que o usuário não foi encontrado
    mock_user_repo.find_by_id.return_value = None
    
    # Act & Assert
    with pytest.raises(UserNotFoundError):
        user_service.update_user(user_id, update_data)
        
    mock_user_repo.update.assert_not_called()

def test_disable_user_success(user_service: UserService, mock_user_repo: MagicMock):
    """
    Valida a desativação (exclusão lógica) de um usuário.
    Importância: Cobre o cenário de "soft delete", que é uma prática comum
    e de negócio importante, garantindo que o serviço invoca a ação correta.
    """
    # Arrange
    user_id = "user-to-disable"
    existing_user = User(id=user_id, username="testuser", email="test@example.com")
    mock_user_repo.find_by_id.return_value = existing_user
    
    # Act
    user_service.disable_user(user_id)
    
    # Assert
    mock_user_repo.find_by_id.assert_called_once_with(user_id)
    mock_user_repo.disable.assert_called_once_with(user_id)