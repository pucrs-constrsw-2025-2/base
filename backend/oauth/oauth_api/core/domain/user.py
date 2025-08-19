from pydantic import BaseModel, EmailStr


class User(BaseModel):
    id: str
    username: str
    email: EmailStr
    first_name: str | None = None
    last_name: str | None = None
    enabled: bool = True    # significa que o usuario esta ativo??
    password: str | None = None
