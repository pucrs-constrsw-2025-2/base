from pydantic import BaseModel, EmailStr


class User(BaseModel):
    id: str
    username: str
    first_name: str | None = None
    last_name: str | None = None
    enabled: bool | True
    password: str | None = None
