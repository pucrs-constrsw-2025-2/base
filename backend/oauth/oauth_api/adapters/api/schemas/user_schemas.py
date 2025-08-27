from pydantic import BaseModel, ConfigDict, EmailStr, Field

# ---------------------------------------------------------------------------
# Schemas Base para Reutilização
# ---------------------------------------------------------------------------


class UserBase(BaseModel):
    """Schema base com os campos comuns de um usuário."""

    # Usamos 'alias' para mapear o camelCase do JSON para o snake_case do Python.
    # Isso torna a API robusta a diferentes convenções de nomenclatura.
    first_name: str = Field(..., example="João", alias="firstName")
    last_name: str = Field(..., example="Silva", alias="lastName")

    # Configuração para permitir o uso de aliases na (de)serialização
    model_config = ConfigDict(populate_by_name=True)


# ---------------------------------------------------------------------------
# Schemas para Requisições (Request Bodies)
# ---------------------------------------------------------------------------


class UserCreateRequest(UserBase):
    """Schema para a criação de um usuário. Herda de UserBase e adiciona os campos necessários."""

    username: EmailStr = Field(..., example="joao.silva@email.com")
    password: str = Field(..., min_length=8, example="strongPassword123")

    model_config = ConfigDict(
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "username": "joao.silva@email.com",
                "password": "strongPassword123",
                "firstName": "João",
                "lastName": "Silva",
            }
        },
    )


class UserUpdateRequest(UserBase):
    """
    Schema para a atualização de um usuário.
    Herda os campos de UserBase que podem ser atualizados.
    """

    model_config = ConfigDict(
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "firstName": "José",
                "lastName": "Santos",
            }
        },
    )


class PasswordUpdateRequest(BaseModel):
    """Schema específico para a atualização de senha."""

    password: str = Field(..., min_length=8, example="newStrongPassword123")

    model_config = ConfigDict(
        json_schema_extra={"example": {"password": "newStrongPassword123"}}
    )


# ---------------------------------------------------------------------------
# Schemas para Respostas (Response Bodies)
# ---------------------------------------------------------------------------


class UserResponse(UserBase):
    """
    Schema para a resposta pública de um usuário.
    Herda de UserBase e adiciona campos seguros para exibição.
    """

    id: str = Field(..., example="a0b3827f-4912-4cfc-a2b8-a6d15e2a865b")
    username: EmailStr = Field(..., example="joao.silva@email.com")
    enabled: bool = Field(..., example=True)

    # A configuração model_config permite definir um exemplo completo
    # que será exibido na documentação do Swagger UI.
    model_config = ConfigDict(
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "id": "a0b3827f-4912-4cfc-a2b8-a6d15e2a865b",
                "username": "joao.silva@email.com",
                "firstName": "João",
                "lastName": "Silva",
                "enabled": True,
            }
        },
    )


class TokenResponse(BaseModel):
    """Schema para a resposta do endpoint de login."""

    access_token: str
    expires_in: int
    refresh_expires_in: int
    refresh_token: str
    token_type: str

    # Os campos retornados pelo endpoint /token do Keycloak já são snake_case,
    # então não precisamos de aliases, mas podemos adicionar um exemplo.
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "access_token": "eyJhbGciOiJSUzI1NiIsIn...",
                "expires_in": 300,
                "refresh_expires_in": 1800,
                "refresh_token": "eyJhbGciOiJIUzI1NiIsIn...",
                "token_type": "Bearer",
            }
        }
    )
