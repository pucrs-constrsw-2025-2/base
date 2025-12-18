from typing import Annotated, Any

import httpx
from cachetools import TTLCache
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt

from src.adapters.keycloak.keycloak_client import KeycloakAdminClient
from src.adapters.keycloak.keycloak_role_repository import KeycloakRoleRepository
from src.adapters.keycloak.keycloak_user_repository import KeycloakUserRepository
from src.config import settings
from src.core.exceptions import InvalidTokenError
from src.core.ports.role_repository import IRoleRepository
from src.core.ports.user_repository import IUserRepository
from src.core.services.role_service import RoleService
from src.core.services.user_service import UserService

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
        # Decodificar sem validar audience primeiro para verificar se o client ID está no array
        payload = jwt.decode(
            token,
            jwks["keys"],  
            algorithms=[settings.KEYCLOAK_TOKEN_ALGORITHM],
            options={"verify_aud": False},  # Desabilitar validação de audience temporariamente
            issuer=f"{settings.KEYCLOAK_SERVER_URL}/realms/{settings.KEYCLOAK_REALM}",
        )
        
        # Validar audience manualmente: pode ser string ou array
        token_aud = payload.get("aud")
        client_id = settings.KEYCLOAK_CLIENT_ID
        
        if isinstance(token_aud, list):
            # Se audience é array, verificar se o client ID está na lista
            # ou se "oauth" está na lista (client ID pode ser "oauth")
            if client_id not in token_aud and "oauth" not in token_aud:
                # Também verificar se o azp (authorized party) corresponde ao client ID
                azp = payload.get("azp")
                if azp != client_id and azp != "oauth":
                    raise InvalidTokenError(
                        description=f"Token audience inválido. Esperado: {client_id}, Recebido: {token_aud}"
                    )
        elif isinstance(token_aud, str):
            # Se audience é string, deve corresponder exatamente
            if token_aud != client_id and token_aud != "oauth":
                azp = payload.get("azp")
                if azp != client_id and azp != "oauth":
                    raise InvalidTokenError(
                        description=f"Token audience inválido. Esperado: {client_id}, Recebido: {token_aud}"
                    )
        else:
            # Se não há audience, verificar azp
            azp = payload.get("azp")
            if azp != client_id and azp != "oauth":
                raise InvalidTokenError(
                    description="Token sem audience válido"
                )
        
        # Adicionar o token ao payload para uso posterior
        payload["_token"] = token
        return payload
    except JWTError as e:
        raise InvalidTokenError(description=f"Token inválido ou expirado: {e}") from e


async def get_user_token(
    current_user: Annotated[dict[str, Any], Depends(get_current_user)],
) -> str:
    """
    Extrai o token JWT do usuário autenticado.
    """
    return current_user.get("_token", "")


# --- Funções de Injeção de Dependência ---
def get_user_repository(
    user_token: Annotated[str, Depends(get_user_token)],
) -> IUserRepository:
    """
    Cria um repositório de usuários usando o token do usuário autenticado.
    """
    client = KeycloakAdminClient(user_token=user_token)
    return KeycloakUserRepository(client=client)


def get_role_repository(
    user_token: Annotated[str, Depends(get_user_token)],
) -> IRoleRepository:
    """
    Cria um repositório de roles usando o token do usuário autenticado.
    """
    client = KeycloakAdminClient(user_token=user_token)
    return KeycloakRoleRepository(client=client)


def get_user_service(
    user_repo: Annotated[IUserRepository, Depends(get_user_repository)],
    role_repo: Annotated[IRoleRepository, Depends(get_role_repository)],
) -> UserService:
    """
    Cria um serviço de usuários usando os repositórios com token do usuário.
    """
    return UserService(user_repo=user_repo, role_repo=role_repo)


def get_role_service(
    role_repo: Annotated[IRoleRepository, Depends(get_role_repository)],
    user_repo: Annotated[IUserRepository, Depends(get_user_repository)],
) -> RoleService:
    """
    Cria um serviço de roles usando os repositórios com token do usuário.
    """
    return RoleService(role_repository=role_repo, user_repository=user_repo)