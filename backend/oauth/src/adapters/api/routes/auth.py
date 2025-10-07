# auth.py
from typing import Annotated, Any

import httpx
from fastapi import APIRouter, Depends, Form, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from oauth_api.adapters.api.schemas.auth_schemas import IntrospectResponse
from oauth_api.adapters.api.schemas.user_schemas import TokenResponse
from oauth_api.config import settings

router = APIRouter(tags=["Authentication"])

# Dependência para extrair o token do header Authorization
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Autenticação de Usuário",
    status_code=status.HTTP_201_CREATED,
)
async def login(username: Annotated[str, Form()], password: Annotated[str, Form()]):
    """
    Autentica o usuário com username e password, usando o 'password' grant type do Keycloak.
    Retorna access_token e refresh_token.
    """
    async with httpx.AsyncClient() as client:
        token_data = {
            "client_id": settings.KEYCLOAK_CLIENT_ID,
            "client_secret": settings.KEYCLOAK_CLIENT_SECRET,
            "username": username,
            "password": password,
            "grant_type": "password",
        }
        try:
            response = await client.post(settings.keycloak_token_url, data=token_data)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            if e.response.status_code in (400, 401):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Credenciais inválidas. Verifique o usuário e a senha.",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            raise


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Renovação de Access Token",
    status_code=status.HTTP_201_CREATED,
)
async def refresh_token(refresh_token: Annotated[str, Form()]):
    """
    Obtém um novo access_token e refresh_token usando um refresh_token válido.
    """
    async with httpx.AsyncClient() as client:
        token_data = {
            "client_id": settings.KEYCLOAK_CLIENT_ID,
            "client_secret": settings.KEYCLOAK_CLIENT_SECRET,
            "refresh_token": refresh_token,
            "grant_type": "refresh_token",
        }
        try:
            response = await client.post(settings.keycloak_token_url, data=token_data)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 400:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Refresh token inválido ou expirado.",
                )
            raise


@router.post(
    "/validate",
    response_model=IntrospectResponse,
    summary="Validação de Access Token",
    status_code=status.HTTP_200_OK,
)
async def validate_token(token: Annotated[str, Depends(oauth2_scheme)]):
    """
    Valida um access_token, verificando sua autenticidade e se não está expirado
    junto ao provedor de identidade (Keycloak).
    """
    async with httpx.AsyncClient() as client:
        keycloak_introspect_url = f"{settings.keycloak_token_url}/introspect"
        try:
            response = await client.post(
                keycloak_introspect_url,
                data={"token": token},
                auth=(settings.KEYCLOAK_CLIENT_ID, settings.KEYCLOAK_CLIENT_SECRET),
            )
            response.raise_for_status()
            introspection_result = response.json()

            if not introspection_result.get("active"):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token inválido ou expirado.",
                    headers={"WWW-Authenticate": "Bearer"},
                )

            return introspection_result

        except httpx.HTTPStatusError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido ou expirado.",
                headers={"WWW-Authenticate": "Bearer"},
            )