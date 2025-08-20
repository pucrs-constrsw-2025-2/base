from fastapi import APIRouter, Depends, status, Response
from oauth_api.core.services.role_service import RoleService
from oauth_api.adapters.api.dependencies import get_role_service, get_user_service, get_current_user
from oauth_api.adapters.api.schemas.user_schemas import (
    UserCreateRequest,
    UserResponse,
    UserUpdateRequest,
    PasswordUpdateRequest,
)
from oauth_api.core.services.user_service import UserService
from oauth_api.adapters.api.schemas.role_schemas import UserRolesRequest

router = APIRouter(prefix="/users", tags=["Users"])

@router.post(
    "",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Cria um novo usuário",
)
async def create_user(
    user_data: UserCreateRequest,
    user_service: UserService = Depends(get_user_service),
):
    """Cria um novo usuário no sistema."""
    return await user_service.create_user(user_data.model_dump())

@router.get(
    "",
    response_model=list[UserResponse],
    summary="Lista todos os usuários",
)
async def get_all_users(
    enabled: bool | None = None,
    user_service: UserService = Depends(get_user_service),
    _: dict = Depends(get_current_user),
):
    """Retorna uma lista de usuários, com filtros opcionais."""
    return await user_service.find_all(enabled=enabled)

@router.get(
    "/{user_id}",
    response_model=UserResponse,
    summary="Busca um usuário por ID",
)
async def get_user_by_id(
    user_id: str,
    user_service: UserService = Depends(get_user_service),
    _: dict = Depends(get_current_user),
):
    """Retorna os detalhes de um usuário específico."""
    return await user_service.find_by_id(user_id)

@router.put(
    "/{user_id}",
    response_model=UserResponse,
    summary="Atualiza um usuário",
)
async def update_user(
    user_id: str,
    user_data: UserUpdateRequest,
    user_service: UserService = Depends(get_user_service),
    _: dict = Depends(get_current_user),
):
    """Atualiza as informações de um usuário e retorna o objeto atualizado."""
    return await user_service.update_user(user_id, user_data.model_dump(exclude_unset=True))

@router.patch(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Reseta a senha de um usuário",
)
async def reset_password(
    user_id: str,
    password_data: PasswordUpdateRequest,
    user_service: UserService = Depends(get_user_service),
    _: dict = Depends(get_current_user),
):
    """Define uma nova senha para o usuário."""
    await user_service.reset_password(user_id, password_data.password)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Desativa um usuário",
)
async def delete_user(
    user_id: str,
    user_service: UserService = Depends(get_user_service),
    _: dict = Depends(get_current_user),
):
    """Realiza a exclusão lógica (desativação) de um usuário."""
    await user_service.disable_user(user_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.post(
    "/{user_id}/roles",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Atribui roles a um usuário",
)
async def assign_roles_to_user(
    user_id: str,
    request: UserRolesRequest,
    role_service: RoleService = Depends(get_role_service),
):
    """Atribui um ou mais roles a um usuário específico."""
    await role_service.assign_roles_to_user(user_id, request.role_ids)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete(
    "/{user_id}/roles",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove roles de um usuário",
)
async def remove_roles_from_user(
    user_id: str,
    request: UserRolesRequest,
    role_service: RoleService = Depends(get_role_service),
):
    """Remove um ou mais roles de um usuário específico."""
    await role_service.remove_roles_from_user(user_id, request.role_ids)
    return Response(status_code=status.HTTP_204_NO_CONTENT)