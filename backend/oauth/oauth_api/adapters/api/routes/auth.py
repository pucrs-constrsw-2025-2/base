from typing import Annotated

import httpx
from fastapi import APIRouter, Form, status

from oauth_api.adapters.api.schemas.user_schemas import TokenResponse
from oauth_api.config import settings
from oauth_api.core.exceptions import InvalidCredentialsError

router = APIRouter(tags=["Authentication"])


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Autenticação de Usuário",
    status_code=status.HTTP_201_CREATED,
)
async def login(username: Annotated[str, Form()], password: Annotated[str, Form()]):
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
                raise InvalidCredentialsError() from e
            raise
