from pydantic import BaseModel

# Adicionado um Pydantic model para a resposta do endpoint de validação
class IntrospectResponse(BaseModel):
    """Schema para a resposta da introspecção do token."""

    active: bool
    username: str | None = None
    scope: str | None = None
    client_id: str | None = None
    exp: int | None = None
    iat: int | None = None