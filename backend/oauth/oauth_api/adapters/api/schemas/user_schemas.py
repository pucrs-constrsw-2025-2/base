from pydantic import BaseModel, EmailStr, ConfigDict

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    username: str | None = None
    email: EmailStr | None = None
    firstName: str | None = None
    lastName: str | None = None

class UserPublic(BaseModel):
    id: str
    username: str
    email: EmailStr

    model_config = ConfigDict(from_attributes=True)
        
class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    
class PasswordReset(BaseModel):
    password: str