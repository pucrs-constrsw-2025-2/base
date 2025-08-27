from pydantic import BaseModel, ConfigDict, Field


class RoleBase(BaseModel):
    """Schema base para roles, com campos comuns."""

    name: str = Field(..., min_length=3, max_length=50, description="Nome do role.")
    description: str | None = Field(
        None, max_length=255, description="Descrição do role."
    )


class RoleCreateRequest(RoleBase):
    """Schema para a criação de um novo role."""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "admin",
                "description": "Administrador do sistema",
            }
        }
    )


class RoleUpdateRequest(RoleBase):
    """Schema para a atualização completa de um role (PUT)."""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "gerente",
                "description": "Gerente de projetos",
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

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "desenvolvedor",
                "description": "Desenvolvedor de software",
            }
        }
    )


class RoleResponse(RoleBase):
    """Schema para a resposta da API, incluindo o ID do role."""

    id: str = Field(..., description="ID único do role.")
    model_config = ConfigDict(
        from_attributes=True,
        json_schema_extra={
            "example": {
                "id": "a0b3827f-4912-4cfc-a2b8-a6d15e2a865b",
                "name": "admin",
                "description": "Administrador do sistema",
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
