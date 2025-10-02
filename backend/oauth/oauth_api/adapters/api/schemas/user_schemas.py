from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, Field

# ---------------------------------------------------------------------------
# Constantes para Exemplos
# ---------------------------------------------------------------------------

EXAMPLE_USER_EMAIL = "joao.silva@email.com"
EXAMPLE_USER_FIRST_NAME = "João"
EXAMPLE_USER_LAST_NAME = "Silva"
EXAMPLE_USER_PASSWORD = "strongPassword123"
EXAMPLE_USER_NEW_PASSWORD = "newStrongPassword123"
EXAMPLE_USER_ID = "a0b3827f-4912-4cfc-a2b8-a6d15e2a865b"

# ---------------------------------------------------------------------------
# Schemas Base para Reutilização
# ---------------------------------------------------------------------------


class UserBase(BaseModel):
    """Schema base com os campos comuns de um usuário."""

    # Usamos 'alias' para mapear o camelCase do JSON para o snake_case do Python.
    # Isso torna a API robusta a diferentes convenções de nomenclatura.
    first_name: Optional[str] = Field(None, example=EXAMPLE_USER_FIRST_NAME, alias="firstName")
    last_name: Optional[str] = Field(None, example=EXAMPLE_USER_LAST_NAME, alias="lastName")

    # Configuração para permitir o uso de aliases na (de)serialização
    model_config = ConfigDict(populate_by_name=True)


# ---------------------------------------------------------------------------
# Schemas para Requisições (Request Bodies)
# ---------------------------------------------------------------------------


class UserCreateRequest(UserBase):
    """Schema para a criação de um usuário. Herda de UserBase e adiciona os campos necessários."""

    first_name: str = Field(..., example=EXAMPLE_USER_FIRST_NAME, alias="firstName")
    last_name: str = Field(..., example=EXAMPLE_USER_LAST_NAME, alias="lastName")
    username: EmailStr = Field(..., example=EXAMPLE_USER_EMAIL)
    password: str = Field(..., min_length=8, example=EXAMPLE_USER_PASSWORD)

    model_config = ConfigDict(
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "username": EXAMPLE_USER_EMAIL,
                "password": EXAMPLE_USER_PASSWORD,
                "firstName": EXAMPLE_USER_FIRST_NAME,
                "lastName": EXAMPLE_USER_LAST_NAME,
            }
        },
    )


class UserUpdateRequest(UserBase):
    """
    Schema para a atualização de um usuário.
    Herda os campos de UserBase e permite a atualização de qualquer campo do usuário.
    Todos os campos são opcionais.
    """
    username: Optional[EmailStr] = Field(None, example=EXAMPLE_USER_EMAIL)
    enabled: Optional[bool] = Field(None, example=True)

    model_config = ConfigDict(
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "username": "jose.santos@email.com",
                "firstName": "José",
                "lastName": "Santos",
                "enabled": True,
            }
        },
    )


class PasswordUpdateRequest(BaseModel):
    """Schema específico para a atualização de senha."""



    password: str = Field(..., min_length=8, example=EXAMPLE_USER_NEW_PASSWORD)

    model_config = ConfigDict(
        json_schema_extra={"example": {"password": EXAMPLE_USER_NEW_PASSWORD}}
    )


# ---------------------------------------------------------------------------
# Schemas para Respostas (Response Bodies)
# ---------------------------------------------------------------------------


class UserResponse(BaseModel):
    """
    Schema para a resposta pública de um usuário.
    """
    id: str = Field(..., example=EXAMPLE_USER_ID)
    username: EmailStr = Field(..., example=EXAMPLE_USER_EMAIL)
    first_name: str = Field(..., example=EXAMPLE_USER_FIRST_NAME, alias="firstName")
    last_name: str = Field(..., example=EXAMPLE_USER_LAST_NAME, alias="lastName")
    enabled: bool = Field(..., example=True)

    # A configuração model_config permite definir um exemplo completo
    # que será exibido na documentação do Swagger UI.
    model_config = ConfigDict(
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "id": EXAMPLE_USER_ID,
                "username": EXAMPLE_USER_EMAIL,
                "firstName": EXAMPLE_USER_FIRST_NAME,
                "lastName": EXAMPLE_USER_LAST_NAME,
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