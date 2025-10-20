from fastapi import APIRouter, Depends, Response, status

from src.adapters.api.dependencies import (
    get_current_user,
    get_role_service,
    get_user_service,
)
# Importar o RoleResponse
from src.adapters.api.schemas.role_schemas import RoleResponse, UserRolesRequest
from src.adapters.api.schemas.user_schemas import (
    PasswordUpdateRequest,
    UserCreateRequest,
    UserResponse,
    UserUpdateRequest,
)
from src.core.services.role_service import RoleService
from src.core.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["Users"])


@router.post(
    "",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Criar um novo usuário",
    description="Cria um novo usuário no sistema. Este endpoint pode ser público ou protegido dependendo da configuração global.",
    response_description="Os dados públicos do usuário recém-criado.",
)
async def create_user(
    user_data: UserCreateRequest,
    user_service: UserService = Depends(get_user_service),
    _: dict = Depends(get_current_user),
):
    """Cria um novo usuário no sistema."""
    return await user_service.create_user(user_data.model_dump())


@router.get(
    "",
    response_model=list[UserResponse],
    summary="Listar todos os usuários",
    description="Retorna uma lista de todos os usuários cadastrados, com a opção de filtrar por status (enabled). Requer autenticação.",
    response_description="Uma lista contendo os usuários.",
    dependencies=[Depends(get_current_user)],
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
    summary="Buscar um usuário por ID",
    description="Retorna os detalhes de um usuário específico a partir do seu ID. Requer autenticação.",
    response_description="Os dados detalhados do usuário solicitado.",
    dependencies=[Depends(get_current_user)],
)
async def get_user_by_id(
    user_id: str,
    user_service: UserService = Depends(get_user_service),
    _: dict = Depends(get_current_user),
):
    """Retorna os detalhes de um usuário específico."""
    return await user_service.find_by_id(user_id)


@router.get(
    "/{user_id}/roles",
    response_model=list[RoleResponse],
    summary="Listar roles de um usuário",
    description="Retorna uma lista com todos os roles associados a um usuário específico.",
    response_description="Uma lista contendo os roles do usuário.",
    dependencies=[Depends(get_current_user)],
)
async def get_user_roles(
    user_id: str,
    user_service: UserService = Depends(get_user_service),
):
    """Busca e retorna todos os roles de um usuário específico."""
    return await user_service.get_user_roles(user_id)


@router.put(
    "/{user_id}",
    status_code=status.HTTP_200_OK,
    summary="Atualizar um usuário (completo)",
    description="Atualiza as informações de um usuário existente. Todos os campos devem ser fornecidos. Requer autenticação.",
    response_description="Nenhum conteúdo retornado em caso de sucesso.",
    dependencies=[Depends(get_current_user)],
)
async def update_user(
    user_id: str,
    user_data: UserUpdateRequest,
    user_service: UserService = Depends(get_user_service),
    _: dict = Depends(get_current_user),
):
    """Atualiza as informações de um usuário."""
    await user_service.update_user(
        user_id, user_data.model_dump(exclude_unset=True)
    )
    return Response(status_code=status.HTTP_200_OK)


@router.patch(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Atualizar a senha de um usuário",
    description="Define uma nova senha para um usuário específico. O corpo da requisição deve conter a nova senha. Requer autenticação.",
    response_description="Nenhum conteúdo retornado em caso de sucesso.",
    dependencies=[Depends(get_current_user)],
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
    summary="Desativar um usuário",
    description="Realiza a exclusão lógica (desativação) de um usuário, alterando seu status para 'disabled'. Requer autenticação.",
    response_description="Nenhum conteúdo retornado em caso de sucesso.",
    dependencies=[Depends(get_current_user)],
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
    summary="Atribuir roles a um usuário",
    description="Atribui uma ou mais roles a um usuário específico, com base nos IDs das roles fornecidos. Requer autenticação.",
    response_description="Nenhum conteúdo retornado em caso de sucesso.",
    dependencies=[Depends(get_current_user)],
)
async def assign_roles_to_user(
    user_id: str,
    request: UserRolesRequest,
    role_service: RoleService = Depends(get_role_service),
    _: dict = Depends(get_current_user),
):
    """Atribui um ou mais roles a um usuário específico."""
    await role_service.assign_roles_to_user(user_id, request.role_ids)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete(
    "/{user_id}/roles",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remover roles de um usuário",
    description="Remove uma ou mais roles de um usuário específico, com base nos IDs das roles fornecidos. Requer autenticação.",
    response_description="Nenhum conteúdo retornado em caso de sucesso.",
    dependencies=[Depends(get_current_user)],
)
async def remove_roles_from_user(
    user_id: str,
    request: UserRolesRequest,
    role_service: RoleService = Depends(get_role_service),
    _: dict = Depends(get_current_user),
):
    """Remove um ou mais roles de um usuário específico."""
    await role_service.remove_roles_from_user(user_id, request.role_ids)
    return Response(status_code=status.HTTP_204_NO_CONTENT)