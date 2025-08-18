import httpx
from typing import Any, Dict
from oauth_api.config import settings
from oauth_api.core.exceptions import KeycloakAPIError


class KeycloakAdminClient:
    def __init__(self):
        self.base_url = settings.keycloak_admin_api_url
        self._admin_token: str | None = None

    async def _get_admin_token(self) -> str:
        if self._admin_token:
            return self._admin_token
        async with httpx.AsyncClient() as client:
            data = {
                "client_id": settings.KEYCLOAK_CLIENT_ID,
                "client_secret": settings.KEYCLOAK_CLIENT_SECRET,
                "grant_type": "client_credentials",
            }
            try:
                response = await client.post(settings.keycloak_token_url, data=data)
                response.raise_for_status()
                self._admin_token = response.json()["access_token"]
                return self._admin_token
            except httpx.HTTPStatusError as e:
                raise KeycloakAPIError(
                    status_code=e.response.status_code,
                    description=f"Erro ao obter token de admin: {e.response.text}",
                )

    async def _request(
        self, method: str, endpoint: str, **kwargs: Any
    ) -> httpx.Response:
        token = await self._get_admin_token()
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }
        async with httpx.AsyncClient() as client:
            try:
                response = await client.request(
                    method, f"{self.base_url}{endpoint}", headers=headers, **kwargs
                )
                response.raise_for_status()
                return response
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 401:
                    self._admin_token = None
                    token = await self._get_admin_token()
                    headers["Authorization"] = f"Bearer {token}"
                    response = await client.request(
                        method, f"{self.base_url}{endpoint}", headers=headers, **kwargs
                    )
                    response.raise_for_status()
                    return response
                raise KeycloakAPIError(
                    status_code=e.response.status_code,
                    description=f"Erro na API do Keycloak: {e.response.text}",
                )

    async def get(self, endpoint: str, params: Dict | None = None) -> Any:
        response = await self._request("GET", endpoint, params=params)
        return response.json()

    async def post(self, endpoint: str, json: Dict | None = None) -> httpx.Response:
        return await self._request("POST", endpoint, json=json)

    async def put(self, endpoint: str, json: Dict | None = None) -> None:
        await self._request("PUT", endpoint, json=json)

    async def delete(self, endpoint: str, json: Dict | None = None) -> None:
        await self._request("DELETE", endpoint, json=json)
