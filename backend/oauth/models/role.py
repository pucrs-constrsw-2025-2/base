from typing import Optional
from pydantic import BaseModel


class Role(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    deleted: bool = False


class RoleCreate(BaseModel):
    name: str
    description: Optional[str] = None


class RoleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class UserRoleAssign(BaseModel):
    user_id: str
