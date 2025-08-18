from typing import List, Optional
from fastapi import APIRouter, Depends, status, Response
from oauth_api.adapters.api.dependencies import (
    get_user_repository,
    get_user_service,
    get_current_user,
)
from oauth_api.adapters.api.schemas.user_schemas import (
    UserCreateRequest,
    UserResponse,
    UserUpdateRequest,
    PasswordUpdateRequest,
)
from oauth_api.adapters.api.schemas.role_schemas import UserRoleAssignRequest
from oauth_api.core.ports.user_repository import IUserRepository
from oauth_api.core.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["Users"])


@router.post(
    "",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Criação de um novo usuário",
)
async def create_user(
    user_in: UserCreateRequest,
    repo: IUserRepository = Depends(get_user_repository),
    _: dict = Depends(get_current_user),
):
    return await repo.create(user_in.model_dump())


@router.get(
    "", response_model=List[UserResponse], summary="Recuperação de todos os usuários"
)
async def get_all_users(
    enabled: Optional[bool] = None,
    repo: IUserRepository = Depends(get_user_repository),
    _: dict = Depends(get_current_user),
):
    return await repo.find_all(enabled=enabled)


@router.get(
    "/{user_id}",
    response_model=UserResponse,
    summary="Recuperação de um usuário por ID",
)
async def get_user_by_id(
    user_id: str,
    repo: IUserRepository = Depends(get_user_repository),
    _: dict = Depends(get_current_user),
):
    return await repo.find_by_id(user_id)


@router.put(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Atualização de um usuário",
)
async def update_user(
    user_id: str,
    user_in: UserUpdateRequest,
    repo: IUserRepository = Depends(get_user_repository),
    _: dict = Depends(get_current_user),
):
    await repo.update(user_id, user_in.model_dump(exclude_unset=True))
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.patch(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Atualização da senha de um usuário",
)
async def update_user_password(
    user_id: str,
    password_in: PasswordUpdateRequest,
    repo: IUserRepository = Depends(get_user_repository),
    _: dict = Depends(get_current_user),
):
    await repo.reset_password(user_id, password_in.password)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Exclusão lógica de um usuário",
)
async def delete_user(
    user_id: str,
    repo: IUserRepository = Depends(get_user_repository),
    _: dict = Depends(get_current_user),
):
    await repo.disable(user_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post(
    "/{user_id}/roles",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Atribuir um role a um usuário",
)
async def assign_role_to_user(
    user_id: str,
    role_in: UserRoleAssignRequest,
    user_service: UserService = Depends(get_user_service),
    _: dict = Depends(get_current_user),
):
    await user_service.assign_role_to_user(user_id, role_in.role_name)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete(
    "/{user_id}/roles",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remover um role de um usuário",
)
async def remove_role_from_user(
    user_id: str,
    role_in: UserRoleAssignRequest,
    user_service: UserService = Depends(get_user_service),
    _: dict = Depends(get_current_user),
):
    await user_service.remove_role_from_user(user_id, role_in.role_name)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
