from typing import Any, Dict, List, Optional
from pydantic import BaseModel

# Schema para realm_access e resource_access
class RealmAccess(BaseModel):
    roles: List[str] = []

class ResourceAccess(BaseModel):
    roles: List[str] = []

# Adicionado um Pydantic model para a resposta do endpoint de validação
class IntrospectResponse(BaseModel):
    """Schema para a resposta da introspecção do token."""

    active: bool
    username: str | None = None
    preferred_username: str | None = None
    scope: str | None = None
    client_id: str | None = None
    exp: int | None = None
    iat: int | None = None
    sub: str | None = None
    realm_access: Optional[RealmAccess] = None
    resource_access: Optional[Dict[str, ResourceAccess]] = None
    
    class Config:
        extra = "allow"  # Permite campos extras do Keycloak