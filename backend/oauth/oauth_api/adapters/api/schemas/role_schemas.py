from pydantic import BaseModel, ConfigDict, Field


class RoleBase(BaseModel):
    """Schema base para roles, com campos comuns."""

    name: str = Field(..., min_length=3, max_length=50, description="Nome do role.")
    description: str | None = Field(None, max_length=255, description="Descrição do role.")


class RoleCreateRequest(RoleBase):
    """Schema para a criação de um novo role."""

    pass


class RoleUpdateRequest(RoleBase):
    """Schema para a atualização completa de um role (PUT)."""

    pass


class RolePartialUpdateRequest(BaseModel):
    """Schema para a atualização parcial de um role (PATCH)."""

    name: str | None = Field(None, min_length=3, max_length=50, description="Novo nome do role.")
    description: str | None = Field(None, max_length=255, description="Nova descrição do role.")


class RoleResponse(RoleBase):
    """Schema para a resposta da API, incluindo o ID do role."""

    id: str = Field(..., description="ID único do role.")
    model_config = ConfigDict(from_attributes=True)


class UserRolesRequest(BaseModel):
    """Schema para atribuir/remover roles de um usuário."""

    role_ids: list[str] = Field(..., description="Lista de IDs de roles a serem gerenciados.")