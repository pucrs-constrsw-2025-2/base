from pydantic import BaseModel, EmailStr

class User(BaseModel):
    id: str
    username: EmailStr
    first_name: str
    last_name: str
    enabled: bool