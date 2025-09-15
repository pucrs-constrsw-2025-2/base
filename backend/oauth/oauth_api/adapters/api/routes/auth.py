from typing import Annotated

import httpx
from fastapi import APIRouter, Form, status
from fastapi.security import OAuth2PasswordBearer

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
                raise e
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
            # Se o refresh token for inválido/expirado, Keycloak retorna 400
            if e.response.status_code == 400:
                raise e
            raise