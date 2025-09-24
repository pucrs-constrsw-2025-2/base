from typing import Optional
from fastapi import APIRouter, Depends, Response, status

# Supondo que você tenha essas dependências configuradas
from oauth_api.adapters.api.dependencies import get_current_user, get_role_service
from oauth_api.adapters.api.schemas.role_schemas import (
    RoleCreateRequest,
    RolePartialUpdateRequest,
    RoleResponse,
    RoleUpdateRequest,
)
from oauth_api.core.services.role_service import RoleService

router = APIRouter(
    prefix="/roles",
    tags=["Roles"],
    dependencies=[Depends(get_current_user)],
)


@router.post(
    "",
    response_model=RoleResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Criar um novo role",
    description="Cria um novo role no sistema com um nome e uma descrição.",
    response_description="O role recém-criado.",
)
async def create_role(
    role_in: RoleCreateRequest,
    role_service: RoleService = Depends(get_role_service),
):
    """Cria um novo role no sistema."""
    created_role = await role_service.create_role(role_in.model_dump())
    return created_role


@router.get(
    "",
    response_model=list[RoleResponse],
    summary="Listar todos os roles",
    description="Retorna uma lista com todos os roles cadastrados, com a opção de filtrar por status (enabled).",
    response_description="Uma lista contendo todos os roles.",
)
async def get_all_roles(
    enabled: Optional[bool] = None,
    role_service: RoleService = Depends(get_role_service)
):
    """
    Recupera os dados de todos os roles cadastrados.
    
    - Se `enabled=true`, retorna apenas os roles ativos.
    - Se `enabled=false`, retorna apenas os roles inativos.
    - Se o parâmetro for omitido, retorna todos os roles.
    """
    return await role_service.get_all_roles(enabled=enabled)


@router.get(
    "/{role_id}",
    response_model=RoleResponse,
    summary="Buscar um role por ID",
    description="Recupera os dados de um role específico a partir do seu ID único.",
    response_description="Os dados detalhados do role solicitado.",
)
async def get_role_by_id(
    role_id: str,
    role_service: RoleService = Depends(get_role_service),
):
    """Recupera os dados de um role específico pelo seu ID."""
    return await role_service.get_role_by_id(role_id)


@router.put(
    "/{role_id}",
    response_model=RoleResponse,
    summary="Atualizar um role (completo)",
    description="Atualiza todos os dados de um role específico. Todos os campos devem ser fornecidos.",
    response_description="Os dados do role após a atualização completa.",
)
async def update_role(
    role_id: str,
    role_in: RoleUpdateRequest,
    role_service: RoleService = Depends(get_role_service),
):
    """Atualiza todos os dados de um role específico."""
    return await role_service.update_role(role_id, role_in.model_dump())


@router.patch(
    "/{role_id}",
    response_model=RoleResponse,
    summary="Atualizar um role (parcial)",
    description="Atualiza parcialmente os dados de um role específico. Apenas os campos fornecidos no corpo da requisição serão alterados.",
    response_description="Os dados do role após a atualização parcial.",
)
async def partial_update_role(
    role_id: str,
    role_in: RolePartialUpdateRequest,
    role_service: RoleService = Depends(get_role_service),
):
    """Atualiza parcialmente os dados de um role específico."""
    update_data = role_in.model_dump(exclude_unset=True)
    return await role_service.partial_update_role(role_id, update_data)


@router.delete(
    "/{role_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Excluir um role",
    description="Exclui um role do sistema de forma permanente a partir do seu ID. Esta operação não pode ser desfeita.",
    response_description="Nenhum conteúdo retornado em caso de sucesso.",
)
async def delete_role(
    role_id: str,
    role_service: RoleService = Depends(get_role_service),
):
    """Exclui um role do sistema. Esta operação não pode ser desfeita."""
    await role_service.delete_role(role_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
