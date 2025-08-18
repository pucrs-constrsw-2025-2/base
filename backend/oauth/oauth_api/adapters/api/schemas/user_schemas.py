from pydantic import BaseModel, EmailStr, Field


class UserCreateRequest(BaseModel):
    username: EmailStr = Field(..., example="joao.silva@email.com")
    password: str = Field(..., min_length=8, example="strongPassword123")
    first_name: str = Field(..., example="João")
    last_name: str = Field(..., example="Silva")


class UserUpdateRequest(BaseModel):
    first_name: str = Field(..., example="João")
    last_name: str = Field(..., example="Silva")


class PasswordUpdateRequest(BaseModel):
    password: str = Field(..., min_length=8, example="newStrongPassword123")


class UserResponse(BaseModel):
    id: str
    username: EmailStr
    first_name: str
    last_name: str
    enabled: bool


class TokenResponse(BaseModel):
    access_token: str
    expires_in: int
    refresh_expires_in: int
    refresh_token: str
    token_type: str
