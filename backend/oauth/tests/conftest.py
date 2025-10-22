from unittest.mock import AsyncMock, MagicMock

import pytest
from fastapi.testclient import TestClient

from src.adapters.api.dependencies import (
    get_current_user,
    get_role_service,
    get_user_service,
)
from src.core.services.role_service import RoleService
from src.core.services.user_service import UserService

# Importa a aplicação principal e as dependências que serão mockadas
from src.main import app


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
def override_api_dependencies(
    mock_user_service: MagicMock, mock_role_service: MagicMock
):
    """
    Esta fixture com 'autouse=True' roda para TODOS os testes que usam o 'client'.
    Ela substitui as dependências reais (serviços e segurança) pelos nossos dublês,
    isolando a camada de rotas para os testes.
    """
    app.dependency_overrides[get_user_service] = lambda: mock_user_service
    app.dependency_overrides[get_role_service] = lambda: mock_role_service
    # Mock da segurança para não precisar de um token real nos testes de rotas
    app.dependency_overrides[get_current_user] = lambda: {"sub": "test-user-id"}
    yield
    # Limpa os overrides após a execução dos testes para não afetar outros escopos
    app.dependency_overrides.clear()
