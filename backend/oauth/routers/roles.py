from typing import Annotated
from fastapi import APIRouter, Header, Response, HTTPException
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
        raise HTTPException(
            status_code=401,
            detail="Header de autorização 'Bearer' ausente ou mal formatado.",
        )


# --- Endpoints ---
@router.post("/", response_model=dict, status_code=201)
async def create_role_endpoint(
    role: RoleCreate, authorization: Annotated[str | None, Header()] = None
):
    _validate_token(authorization)
    try:
        new_role = create_role(authorization, role)
        return new_role
    except APIException as e:
        raise HTTPException(status_code=e.status_code, detail=e.description)


@router.get("/", response_model=list)
async def get_roles_endpoint(authorization: Annotated[str | None, Header()] = None):
    _validate_token(authorization)
    try:
        return list_roles(authorization)
    except APIException as e:
        raise HTTPException(status_code=e.status_code, detail=e.description)


@router.get("/{role_id}", response_model=dict)
async def get_role_endpoint(
    role_id: str, authorization: Annotated[str | None, Header()] = None
):
    _validate_token(authorization)
    try:
        return get_role_by_id(authorization, role_id)
    except APIException as e:
        raise HTTPException(status_code=e.status_code, detail=e.description)


@router.put("/{role_id}", status_code=204)
async def update_role_endpoint(
    role_id: str,
    role_update: RoleUpdate,
    authorization: Annotated[str | None, Header()] = None,
):
    _validate_token(authorization)
    try:
        update_role(authorization, role_id, role_update)
        return Response(status_code=204)
    except APIException as e:
        raise HTTPException(status_code=e.status_code, detail=e.description)


@router.patch("/{role_id}", status_code=204)
async def patch_role_endpoint(
    role_id: str,
    role_update: RoleUpdate,
    authorization: Annotated[str | None, Header()] = None,
):
    _validate_token(authorization)
    try:
        patch_role(authorization, role_id, role_update)
        return Response(status_code=204)
    except APIException as e:
        raise HTTPException(status_code=e.status_code, detail=e.description)


@router.delete("/{role_id}", status_code=204)
async def delete_role_endpoint(
    role_id: str, authorization: Annotated[str | None, Header()] = None
):
    _validate_token(authorization)
    try:
        logical_delete_role(authorization, role_id)
        return Response(status_code=204)
    except APIException as e:
        raise HTTPException(status_code=e.status_code, detail=e.description)


@router.post("/{role_id}/assign", status_code=204)
async def assign_role_endpoint(
    role_id: str,
    assign: UserRoleAssign,
    authorization: Annotated[str | None, Header()] = None,
):
    _validate_token(authorization)
    try:
        assign_role_to_user(authorization, role_id, assign)
        return Response(status_code=204)
    except APIException as e:
        raise HTTPException(status_code=e.status_code, detail=e.description)


@router.delete("/{role_id}/unassign", status_code=204)
async def unassign_role_endpoint(
    role_id: str,
    assign: UserRoleAssign,
    authorization: Annotated[str | None, Header()] = None,
):
    _validate_token(authorization)
    try:
        unassign_role_from_user(authorization, role_id, assign)
        return Response(status_code=204)
    except APIException as e:
        raise HTTPException(status_code=e.status_code, detail=e.description)
