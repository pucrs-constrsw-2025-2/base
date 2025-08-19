from fastapi import APIRouter, HTTPException, Header, Body
from typing import Annotated
from models.role import RoleCreate, RoleUpdate, UserRoleAssign
from services.role_service import (
    create_role,
    list_roles,
    get_role_by_id,
    update_role,
    logical_delete_role,
    assign_role_to_user,
    unassign_role_from_user,
)


router = APIRouter(prefix="/roles", tags=["roles"])


@router.post("/", response_model=dict, status_code=201)
async def create_role_endpoint(
    role: RoleCreate, authorization: Annotated[str | None, Header()] = None
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Access token inválido")
    return create_role(authorization, role)


@router.get("/", response_model=list)
async def get_roles_endpoint(authorization: Annotated[str | None, Header()] = None):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Access token inválido")
    return list_roles(authorization)


@router.get("/{role_id}", response_model=dict)
async def get_role_endpoint(
    role_id: str, authorization: Annotated[str | None, Header()] = None
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Access token inválido")
    return get_role_by_id(authorization, role_id)


@router.put("/{role_id}", response_model=dict)
async def update_role_endpoint(
    role_id: str,
    role_update: RoleUpdate,
    authorization: Annotated[str | None, Header()] = None,
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Access token inválido")
    return update_role(authorization, role_id, role_update)


@router.patch("/{role_id}", response_model=dict)
async def patch_role_endpoint(
    role_id: str,
    role_update: RoleUpdate,
    authorization: Annotated[str | None, Header()] = None,
):
    # PATCH e PUT são idênticos para Keycloak, ambos usam PUT.
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Access token inválido")
    return update_role(authorization, role_id, role_update)


@router.delete("/{role_id}", response_model=dict)
async def delete_role_endpoint(
    role_id: str, authorization: Annotated[str | None, Header()] = None
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Access token inválido")
    return logical_delete_role(authorization, role_id)


@router.post("/{role_id}/assign", response_model=dict)
async def assign_role_endpoint(
    role_id: str,
    assign: UserRoleAssign,
    authorization: Annotated[str | None, Header()] = None,
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Access token inválido")
    return assign_role_to_user(authorization, role_id, assign)


@router.delete("/{role_id}/unassign", response_model=dict)
async def unassign_role_endpoint(
    role_id: str,
    assign: UserRoleAssign,  # O user_id vem no corpo da requisição
    authorization: Annotated[str | None, Header()] = None,
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Access token inválido")
    return unassign_role_from_user(authorization, role_id, assign)
