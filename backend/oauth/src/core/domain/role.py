from pydantic import BaseModel


class Role(BaseModel):
    id: str
    name: str
    description: str | None = None
    enabled: bool
