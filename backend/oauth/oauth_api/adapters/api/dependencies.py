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
    try:
        jwks = await get_jwks()
        unverified_header = jwt.get_unverified_header(token)
        if unverified_header.get("alg") != settings.KEYCLOAK_TOKEN_ALGORITHM:
            raise InvalidTokenError(description="Algoritmo do token é inválido.")

        rsa_key = {}
        for key in jwks["keys"]:
            if key["kid"] == unverified_header["kid"]:
                rsa_key = {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "use": key["use"],
                    "n": key["n"],
                    "e": key["e"],
                }

        if not rsa_key:
            raise InvalidTokenError(
                description="Chave pública (kid) não encontrada no JWKS."
            )

        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=[settings.KEYCLOAK_TOKEN_ALGORITHM],
            audience=settings.KEYCLOAK_CLIENT_ID,
            issuer=f"{settings.KEYCLOAK_SERVER_URL}/realms/{settings.KEYCLOAK_REALM}",
        )
        return payload
    except JWTError as e:
        raise InvalidTokenError(description=f"Erro na validação do token: {e}") from e


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
