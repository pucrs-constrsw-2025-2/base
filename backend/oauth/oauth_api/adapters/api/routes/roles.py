from fastapi import APIRouter, Depends, status, Response
from oauth_api.adapters.api.schemas.role_schemas import (
    RoleCreateRequest,
    RoleResponse,
    RoleUpdateRequest,
    RolePartialUpdateRequest,
)
from oauth_api.core.services.role_service import RoleService
# Supondo que você tenha essas dependências configuradas
from oauth_api.adapters.api.dependencies import get_role_service, get_current_user

router = APIRouter(
    prefix="/roles",
    tags=["Roles"],
    dependencies=[Depends(get_current_user)],
)

@router.post(
    "",
    response_model=RoleResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Cria um novo role",
)
async def create_role(
    role_in: RoleCreateRequest,
    role_service: RoleService = Depends(get_role_service),
):
    """Cria um novo role no sistema."""
    created_role = await role_service.create_role(role_in.model_dump())
    return created_role


@router.get("", response_model=list[RoleResponse], summary="Recupera todos os roles")
async def get_all_roles(role_service: RoleService = Depends(get_role_service)):
    """Recupera os dados de todos os roles cadastrados."""
    return await role_service.get_all_roles()


@router.get("/{role_id}", response_model=RoleResponse, summary="Recupera um role pelo ID")
async def get_role_by_id(
    role_id: str,
    role_service: RoleService = Depends(get_role_service),
):
    """Recupera os dados de um role específico pelo seu ID."""
    return await role_service.get_role_by_id(role_id)


@router.put("/{role_id}", response_model=RoleResponse, summary="Atualiza um role")
async def update_role(
    role_id: str,
    role_in: RoleUpdateRequest,
    role_service: RoleService = Depends(get_role_service),
):
    """Atualiza todos os dados de um role específico."""
    return await role_service.update_role(role_id, role_in.model_dump())


@router.patch("/{role_id}", response_model=RoleResponse, summary="Atualiza um role parcialmente")
async def partial_update_role(
    role_id: str,
    role_in: RolePartialUpdateRequest,
    role_service: RoleService = Depends(get_role_service),
):
    """Atualiza parcialmente os dados de um role específico."""
    return await role_service.partial_update_role(role_id, role_in.model_dump())


@router.delete(
    "/{role_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Exclui um role",
)
async def delete_role(
    role_id: str,
    role_service: RoleService = Depends(get_role_service),
):
    """Exclui um role do sistema. Esta operação não pode ser desfeita."""
    await role_service.delete_role(role_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)