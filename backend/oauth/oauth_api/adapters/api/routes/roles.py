from typing import List
from fastapi import APIRouter, Depends, status, Response
from oauth_api.adapters.api.dependencies import (
    get_role_repository,
    get_role_service,
    get_current_user,
)
from oauth_api.adapters.api.schemas.role_schemas import RoleCreateRequest, RoleResponse
from oauth_api.core.ports.role_repository import IRoleRepository
from oauth_api.core.services.role_service import RoleService

router = APIRouter(prefix="/roles", tags=["Roles"])


@router.post(
    "",
    response_model=RoleResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Criação de um novo role",
)
async def create_role(
    role_in: RoleCreateRequest,
    repo: IRoleRepository = Depends(get_role_repository),
    _: dict = Depends(get_current_user),
):
    return await repo.create(role_in)


@router.get(
    "", response_model=List[RoleResponse], summary="Recuperação de todos os roles"
)
async def get_all_roles(
    repo: IRoleRepository = Depends(get_role_repository),
    _: dict = Depends(get_current_user),
):
    return await repo.find_all()


@router.get(
    "/{role_name}",
    response_model=RoleResponse,
    summary="Recuperação de um role pelo nome",
)
async def get_role_by_name(
    role_name: str,
    service: RoleService = Depends(get_role_service),
    _: dict = Depends(get_current_user),
):
    return await service.get_by_name_or_fail(role_name)


@router.put(
    "/{role_name}", response_model=RoleResponse, summary="Atualização de um role"
)
async def update_role(
    role_name: str,
    role_in: RoleCreateRequest,
    repo: IRoleRepository = Depends(get_role_repository),
    _: dict = Depends(get_current_user),
):
    return await repo.update(role_name, role_in)


@router.delete(
    "/{role_name}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Exclusão de um role",
)
async def delete_role(
    role_name: str,
    service: RoleService = Depends(get_role_service),
    _: dict = Depends(get_current_user),
):
    await service.delete_or_fail(role_name)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
