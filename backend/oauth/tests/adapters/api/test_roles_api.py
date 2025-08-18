import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock

from oauth_api.main import app
from oauth_api.core.services.role_service import RoleService
from oauth_api.core.domain.role import Role

# Mock do serviço que será injetado
mock_role_service = MagicMock(spec=RoleService)

# Assumindo uma dependência 'get_role_service' para o override
# from oauth_api.adapters.api.dependencies import get_role_service
# app.dependency_overrides[get_role_service] = lambda: mock_role_service

client = TestClient(app)

@pytest.fixture(autouse=True)
def reset_mock_service():
    """Reseta o estado do mock antes de cada teste."""
    mock_role_service.reset_mock()
    yield

def test_create_role_api_success():
    """
    Valida a criação de uma role via POST /roles.
    Importância: Confirma que o endpoint de criação de roles está funcionando,
    incluindo validação de schema e resposta HTTP 201.
    """
    # Arrange
    role_data = {"name": "manager", "description": "Manager Role"}
    expected_response = {"id": "role-xyz", **role_data}
    mock_role_service.create_role.return_value = Role(**expected_response)

    # Act
    response = client.post("/roles", json=role_data)

    # Assert
    assert response.status_code == 201
    assert response.json() == expected_response
    mock_role_service.create_role.assert_called_once_with(role_data)

def test_assign_roles_to_user_api_success():
    """
    Valida a atribuição de roles a um usuário via POST /users/{user_id}/roles.
    Importância: Testa um endpoint de relacionamento, garantindo que a API
    consegue processar um corpo de requisição com uma lista de roles e
    chamar o serviço correspondente para cada uma.
    """
    # Arrange
    user_id = "user-abc"
    roles_to_assign = {"roles": ["role-1", "role-2"]}
    mock_role_service.assign_role_to_user.return_value = None

    # Act
    response = client.post(f"/users/{user_id}/roles", json=roles_to_assign)

    # Assert
    assert response.status_code == 200 # ou 204
    # Verifica se o serviço foi chamado para cada role na lista
    assert mock_role_service.assign_role_to_user.call_count == 2
    mock_role_service.assign_role_to_user.assert_any_call(user_id, "role-1")
    mock_role_service.assign_role_to_user.assert_any_call(user_id, "role-2")

def test_remove_roles_from_user_api_success():
    """
    Valida a remoção de roles de um usuário via DELETE /users/{user_id}/roles.
    Importância: Similar ao teste de atribuição, garante que o fluxo de remoção
    de permissões está funcionando corretamente na camada de API.
    """
    # Arrange
    user_id = "user-abc"
    roles_to_remove = {"roles": ["role-1"]}
    mock_role_service.remove_role_from_user.return_value = None

    # Act
    # O método DELETE em APIs RESTful pode ter um corpo, especialmente para operações em lote
    response = client.delete(f"/users/{user_id}/roles", json=roles_to_remove)

    # Assert
    assert response.status_code == 204
    mock_role_service.remove_role_from_user.assert_called_once_with(user_id, "role-1")