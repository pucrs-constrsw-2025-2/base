from typing import Optional
from pydantic import BaseModel
from typing import List


class Credential(BaseModel):
    type: str = "password"
    value: str
    temporary: bool = False


class UserCreate(BaseModel):
    username: str
    first_name: str
    last_name: str
    email: str
    credentials: List[Credential]


# Modelo Pydantic para os dados do usuário
class User(BaseModel):
    username: str
    # password: str
    first_name: str
    last_name: str
    email: str


# Modelo para atualização de usuário (password opcional)
class UserUpdate(BaseModel):
    username: str
    first_name: str
    last_name: str
    email: str
    password: Optional[str] = None  # Password opcional para update


class LoginRequest(BaseModel):
    username: str
    password: str


# Modelo para a resposta do token
class TokenResponse(BaseModel):
    token_type: str
    access_token: str
    expires_in: int
    refresh_token: str
    refresh_expires_in: int
