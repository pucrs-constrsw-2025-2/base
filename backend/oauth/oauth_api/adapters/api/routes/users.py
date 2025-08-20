from fastapi import APIRouter, Depends, status
from oauth_api.adapters.api.dependencies import get_user_service, oauth2_scheme
from oauth_api.adapters.api.schemas.user_schemas import UserCreate, UserPublic, UserUpdate, PasswordReset
from oauth_api.core.services.user_service import UserService

# A dependência de segurança foi removida do router para ser aplicada por endpoint
router = APIRouter(prefix="/users", tags=["Users"])

# A criação de usuário deve ser uma rota pública, sem dependência de segurança
@router.post(
    "/",
    response_model=UserPublic,
    status_code=status.HTTP_201_CREATED,
    summary="Cria um novo usuário",
)
async def create_user(
    user_data: UserCreate,
    user_service: UserService = Depends(get_user_service),
):
    """Cria um novo usuário no sistema."""
    new_user = await user_service.create_user(user_data.model_dump())
    return new_user

# Todas as outras rotas que manipulam ou visualizam usuários devem ser protegidas
@router.get(
    "/",
    response_model=list[UserPublic],
    summary="Lista todos os usuários",
    dependencies=[Depends(oauth2_scheme)],
)
async def get_users(
    enabled: bool | None = None,
    user_service: UserService = Depends(get_user_service),
):
    """Retorna uma lista de usuários, com filtros opcionais."""
    users = await user_service.find_all(enabled=enabled)
    return users

@router.get(
    "/{user_id}",
    response_model=UserPublic,
    summary="Busca um usuário por ID",
    dependencies=[Depends(oauth2_scheme)],
)
async def get_user_by_id(
    user_id: str,
    user_service: UserService = Depends(get_user_service),
):
    """Retorna os detalhes de um usuário específico."""
    user = await user_service.find_user_by_id(user_id)
    return user

@router.put(
    "/{user_id}",
    response_model=UserPublic,
    summary="Atualiza um usuário",
    dependencies=[Depends(oauth2_scheme)],
)
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    user_service: UserService = Depends(get_user_service),
):
    """Atualiza as informações de um usuário existente."""
    await user_service.update_user(user_id, user_data.model_dump(exclude_unset=True))
    updated_user = await user_service.find_user_by_id(user_id)
    return updated_user

@router.patch(
    "/{user_id}",
    status_code=status.HTTP_200_OK,
    summary="Reseta a senha de um usuário",
    dependencies=[Depends(oauth2_scheme)],
)
async def reset_password(
    user_id: str,
    password_data: PasswordReset,
    user_service: UserService = Depends(get_user_service),
):
    """Define uma nova senha para o usuário."""
    await user_service.reset_password(user_id, password_data.password)
    return {"message": "Password has been reset."}

@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Desativa um usuário",
    dependencies=[Depends(oauth2_scheme)],
)
async def delete_user(
    user_id: str,
    user_service: UserService = Depends(get_user_service),
):
    """Realiza a exclusão lógica de um usuário."""
    await user_service.disable_user(user_id)
    return None