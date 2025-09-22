# Onde: oauth_api/adapters/api/schemas/role_schemas.py

from pydantic import BaseModel, ConfigDict, Field


class RoleBase(BaseModel):
    """Schema base para roles, com campos comuns."""

    name: str = Field(..., min_length=3, max_length=50, description="Nome do role.")
    description: str | None = Field(
        None, max_length=255, description="Descrição do role."
    )


class RoleCreateRequest(RoleBase):
    """Schema para a criação de um novo role."""
    # Opcional: permitir definir o estado na criação, mas o padrão já é 'True' no domínio.
    enabled: bool = Field(True, description="Define o role como ativo ou inativo.")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "admin",
                "description": "Administrador do sistema",
                "enabled": True,
            }
        }
    )


class RoleUpdateRequest(RoleBase):
    """Schema para a atualização completa de um role (PUT)."""
    enabled: bool = Field(description="Define o role como ativo ou inativo.")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "gerente",
                "description": "Gerente de projetos",
                "enabled": True,
            }
        }
    )


class RolePartialUpdateRequest(BaseModel):
    """Schema para a atualização parcial de um role (PATCH)."""

    name: str | None = Field(
        None, min_length=3, max_length=50, description="Novo nome do role."
    )
    description: str | None = Field(
        None, max_length=255, description="Nova descrição do role."
    )
    enabled: bool | None = Field(None, description="Muda o estado do role para ativo ou inativo.")

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "description": "Desenvolvedor de software sênior",
                "enabled": False,
            }
        }
    )


class RoleResponse(RoleBase):
    """Schema para a resposta da API, incluindo o ID e o estado do role."""

    id: str = Field(..., description="ID único do role.")
    enabled: bool = Field(..., description="Indica se o role está ativo.")
    
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": "a0b3827f-4912-4cfc-a2b8-a6d15e2a865b",
                "name": "admin",
                "description": "Administrador do sistema",
                "enabled": True,
            }
        },
    )


class UserRolesRequest(BaseModel):
    """Schema para atribuir/remover roles de um usuário."""

    role_ids: list[str] = Field(
        ..., description="Lista de IDs de roles a serem gerenciados."
    )

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "role_ids": [
                    "a0b3827f-4912-4cfc-a2b8-a6d15e2a865b",
                    "b1c4938g-5023-5dfd-b3c9-b7e26f3b976c",
                ]
            }
        }
    )