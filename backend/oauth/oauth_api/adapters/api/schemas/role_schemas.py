from pydantic import BaseModel, Field


class RoleCreateRequest(BaseModel):
    name: str = Field(..., example="admin")
    description: str | None = Field(
        None, example="Administrator role with full permissions"
    )


class RoleResponse(BaseModel):
    id: str
    name: str
    description: str | None


class UserRoleAssignRequest(BaseModel):
    role_name: str = Field(..., example="admin")
