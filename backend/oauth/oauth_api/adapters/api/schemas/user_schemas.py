from pydantic import BaseModel, EmailStr

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

    class Config:
        from_attributes = True # Permite que o Pydantic leia os dados de um objeto (orm_mode)
        
class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    
class PasswordReset(BaseModel):
    password: str