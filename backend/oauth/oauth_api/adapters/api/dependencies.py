from typing import Annotated, Any

import httpx
from cachetools import TTLCache
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from oauth_api.adapters.keycloak.keycloak_client import KeycloakAdminClient
from oauth_api.adapters.keycloak.keycloak_role_repository import KeycloakRoleRepository
from oauth_api.adapters.keycloak.keycloak_user_repository import KeycloakUserRepository
from oauth_api.config import settings
from oauth_api.core.exceptions import InvalidTokenError
from oauth_api.core.ports.role_repository import IRoleRepository
from oauth_api.core.ports.user_repository import IUserRepository
from oauth_api.core.services.role_service import RoleService
from oauth_api.core.services.user_service import UserService

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")
jwks_cache = TTLCache(maxsize=10, ttl=600)


async def get_jwks() -> dict[str, Any]:
    jwks = jwks_cache.get("jwks")
    if jwks:
        return jwks
    async with httpx.AsyncClient() as client:
        response = await client.get(settings.keycloak_jwks_url)
        response.raise_for_status()
        new_jwks = response.json()
        jwks_cache["jwks"] = new_jwks
        return new_jwks


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
) -> dict[str, Any]:
    """
    Decodifica e valida o token JWT de forma segura.

    Esta função busca o JWKS (JSON Web Key Set) do Keycloak e utiliza a lista
    de chaves para que a biblioteca 'jose' possa selecionar a chave correta
    baseada no 'kid' do cabeçalho do token e então verificar sua assinatura
    e claims. Este método evita a vulnerabilidade de usar um cabeçalho
    não verificado para guiar o processo de validação.
    """
    try:
        jwks = await get_jwks()
        payload = jwt.decode(
            token,
            jwks["keys"],  
            algorithms=[settings.KEYCLOAK_TOKEN_ALGORITHM],
            audience=settings.KEYCLOAK_CLIENT_ID,
            issuer=f"{settings.KEYCLOAK_SERVER_URL}/realms/{settings.KEYCLOAK_REALM}",
        )
        return payload
    except JWTError as e:
        raise InvalidTokenError(description=f"Token inválido ou expirado: {e}") from e


# --- Singletons para os clientes/repositórios ---


keycloak_admin_client = KeycloakAdminClient()
user_repository = KeycloakUserRepository(client=keycloak_admin_client)
role_repository = KeycloakRoleRepository(client=keycloak_admin_client)


# --- Funções de Injeção de Dependência ---
def get_user_repository() -> IUserRepository:
    return user_repository


def get_role_repository() -> IRoleRepository:
    return role_repository


def get_user_service() -> UserService:
    return UserService(user_repo=user_repository, role_repo=role_repository)


def get_role_service() -> RoleService:
    return RoleService(role_repository=role_repository)