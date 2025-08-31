import pytest
from pydantic import ValidationError

from oauth_api.adapters.api.schemas.role_schemas import (
    RoleCreateRequest,
    RolePartialUpdateRequest,
    RoleResponse,
)

# Importando todos os schemas para garantir a cobertura
from oauth_api.adapters.api.schemas.user_schemas import (
    PasswordUpdateRequest,
    UserCreateRequest,
    UserResponse,
    UserUpdateRequest,
)
from oauth_api.core.domain.role import Role


def test_user_create_request_success_with_alias():
    """Testa a criação bem-sucedida de UserCreateRequest usando aliases (camelCase)."""
    data = {
        "username": "teste@exemplo.com",
        "password": "Password123",
        "firstName": "Teste",
        "lastName": "Guri",
    }
    schema = UserCreateRequest(**data)
    assert schema.username == "teste@exemplo.com"
    assert schema.first_name == "Teste"
    assert schema.last_name == "Guri"


def test_user_create_request_invalid_email_raises_error():
    """Testa que um e-mail inválido levanta ValidationError."""
    with pytest.raises(ValidationError):
        UserCreateRequest(
            username="email-invalido",
            password="Password123",
            firstName="T",
            lastName="G",
        )


def test_user_create_request_short_password_raises_error():
    """Testa que uma senha curta levanta ValidationError."""
    with pytest.raises(ValidationError):
        UserCreateRequest(
            username="teste@exemplo.com", password="123", firstName="T", lastName="G"
        )


def test_user_update_request_populates_by_name():
    """Testa que o schema de update aceita aliases."""
    schema = UserUpdateRequest(firstName="José", lastName="Santos")
    assert schema.first_name == "José"
    assert schema.last_name == "Santos"


def test_password_update_request_short_password_raises_error():
    """Testa que o schema de update de senha rejeita senhas curtas."""
    with pytest.raises(ValidationError):
        PasswordUpdateRequest(password="123")


def test_user_response_populates_by_name():
    """Testa que o schema de resposta de usuário consegue lidar com aliases."""
    data = {
        "id": "123",
        "username": "joao@email.com",
        "firstName": "João",
        "lastName": "Silva",
        "enabled": True,
    }
    schema = UserResponse(**data)
    assert schema.first_name == "João"


def test_role_create_request_short_name_raises_error():
    """Testa que o schema de criação de role rejeita nomes curtos."""
    with pytest.raises(ValidationError):
        RoleCreateRequest(name="a")


def test_role_partial_update_request_allows_none():
    """Testa que a atualização parcial de role permite valores nulos."""
    schema = RolePartialUpdateRequest(name=None, description="Nova Desc.")
    assert schema.name is None
    assert schema.description == "Nova Desc."


def test_role_response_from_orm_object():
    """Testa a criação do schema de resposta a partir de um objeto de domínio (from_attributes=True)."""
    domain_role = Role(id="role-id-123", name="tester", description="A test role.")
    schema = RoleResponse.model_validate(domain_role)
    assert schema.id == "role-id-123"
    assert schema.name == "tester"
    assert schema.description == "A test role."
