from typing import Annotated
from fastapi import APIRouter, Header, Response
from models.role import RoleCreate, RoleUpdate, UserRoleAssign
from services.role_service import (
    create_role,
    list_roles,
    get_role_by_id,
    patch_role,
    update_role,
    logical_delete_role,
    assign_role_to_user,
    unassign_role_from_user,
)
from exceptions import APIException

router = APIRouter(prefix="/roles", tags=["roles"])

# Constante para a origem do erro e helper de validação
ERROR_SOURCE = "RoleRouter"

def _validate_token(authorization: str | None):
    """Função auxiliar para validar o header de autorização."""
    if not authorization or not authorization.startswith("Bearer "):
        raise APIException(
            status_code=401,
            error_code="AUTH-401-01",
            description="Header de autorização 'Bearer' ausente ou mal formatado.",
            source=ERROR_SOURCE,
        )

# --- Endpoints ---

@router.post("/", response_model=dict, status_code=201)
async def create_role_endpoint(role: RoleCreate, authorization: Annotated[str | None, Header()] = None):
    _validate_token(authorization)
    # O serviço retorna o dicionário da role criada
    return create_role(authorization, role)


@router.get("/", response_model=list)
async def get_roles_endpoint(authorization: Annotated[str | None, Header()] = None):
    _validate_token(authorization)
    # O serviço retorna a lista de roles
    return list_roles(authorization)


@router.get("/{role_id}", response_model=dict)
async def get_role_endpoint(role_id: str, authorization: Annotated[str | None, Header()] = None):
    _validate_token(authorization)
    # O serviço retorna o dicionário da role encontrada
    return get_role_by_id(authorization, role_id)


@router.put("/{role_id}", status_code=204)
async def update_role_endpoint(role_id: str, role_update: RoleUpdate, authorization: Annotated[str | None, Header()] = None):
    _validate_token(authorization)
    # O serviço não retorna nada em caso de sucesso (None)
    update_role(authorization, role_id, role_update)
    return Response(status_code=204)


@router.patch("/{role_id}", status_code=204)
async def patch_role_endpoint(role_id: str, role_update: RoleUpdate, authorization: Annotated[str | None, Header()] = None):
    _validate_token(authorization)
    patch_role(authorization, role_id, role_update)
    return Response(status_code=204)


@router.delete("/{role_id}", status_code=204)
async def delete_role_endpoint(role_id: str, authorization: Annotated[str | None, Header()] = None):
    _validate_token(authorization)
    logical_delete_role(authorization, role_id)
    return Response(status_code=204)


@router.post("/{role_id}/assign", status_code=204)
async def assign_role_endpoint(role_id: str, assign: UserRoleAssign, authorization: Annotated[str | None, Header()] = None):
    _validate_token(authorization)
    assign_role_to_user(authorization, role_id, assign)
    return Response(status_code=204)


@router.delete("/{role_id}/unassign", status_code=204)
async def unassign_role_endpoint(role_id: str, assign: UserRoleAssign, authorization: Annotated[str | None, Header()] = None):
    _validate_token(authorization)
    unassign_role_from_user(authorization, role_id, assign)
    return Response(status_code=204)