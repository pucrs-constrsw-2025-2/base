from typing import Dict, List, Optional

from oauth_api.core.domain.user import User
from oauth_api.core.exceptions import (
    ConflictAlreadyExistsError,
    KeycloakAPIError,
    NotFoundError,
)
from oauth_api.core.ports.user_repository import IUserRepository

from .keycloak_client import KeycloakAdminClient


class KeycloakUserRepository(IUserRepository):
    # Define a constant for the API endpoint
    _USERS_ENDPOINT = "/users"
    _ROLES_ENDPOINT = "/roles"


    def __init__(self, client: KeycloakAdminClient):
        self.client = client

    def _to_domain(self, kc_user: Dict) -> User:
        return User(
            id=kc_user.get("id", ""),
            username=kc_user.get("username", ""),
            first_name=kc_user.get("firstName", ""),
            last_name=kc_user.get("lastName", ""),
            enabled=kc_user.get("enabled", False),
        )

    async def find_by_id(self, user_id: str) -> Optional[User]:
        try:
            kc_user = await self.client.get(f"{self._USERS_ENDPOINT}/{user_id}")
            return self._to_domain(kc_user)
        except KeycloakAPIError as e:
            if e.status_code == 404:
                raise NotFoundError() from e
            raise

    async def find_by_email(self, email: str) -> Optional[User]:
        params = {"email": email, "exact": "true"}
        kc_users = await self.client.get(self._USERS_ENDPOINT, params=params)
        if not kc_users:
            return None
        return self._to_domain(kc_users[0])

    async def find_all(self, enabled: Optional[bool] = None) -> List[User]:
        kc_users = await self.client.get(self._USERS_ENDPOINT)
        all_users = [self._to_domain(user) for user in kc_users]

        if enabled is None:
            return all_users

        filtered_users = [user for user in all_users if user.enabled == enabled]
        return filtered_users
    
    async def find_users_by_role_name(self, role_name: str) -> List[User]:
        """Busca usuários associados a um role específico no Keycloak."""
        try:
            # Este endpoint retorna uma lista de representações de usuários
            kc_users = await self.client.get(f"{self._ROLES_ENDPOINT}/{role_name}/users")
            return [self._to_domain(user) for user in kc_users]
        except KeycloakAPIError as e:
            # Se o role não for encontrado, retorna uma lista vazia
            if e.status_code == 404:
                return []
            raise

    async def create(self, user_data: dict) -> User:
        kc_payload = {
            "username": user_data["username"],
            "email": user_data["username"],
            "firstName": user_data["first_name"],
            "lastName": user_data["last_name"],
            "enabled": True,
            "credentials": [
                {"type": "password", "value": user_data["password"], "temporary": False}
            ],
        }
        try:
            response = await self.client.post(self._USERS_ENDPOINT, json=kc_payload)
            user_location = response.headers.get("location")
            if not user_location:
                raise KeycloakAPIError(500, "Header 'Location' não encontrado.")
            user_id = user_location.split("/")[-1]
            return await self.find_by_id(user_id)
        except KeycloakAPIError as e:
            if e.status_code == 409:
                raise ConflictAlreadyExistsError() from e
            raise

    async def update(self, user_id: str, user_data: dict) -> None:
        await self.find_by_id(user_id)

        keycloak_field_map = {
            "username": "username",
            "first_name": "firstName",
            "last_name": "lastName",
            "enabled": "enabled",
        }

        kc_payload = {}
        for domain_field, kc_field in keycloak_field_map.items():
            if domain_field in user_data:
                kc_payload[kc_field] = user_data[domain_field]
        
        if "username" in kc_payload:
            kc_payload["email"] = kc_payload["username"]

        if kc_payload:
            await self.client.put(f"{self._USERS_ENDPOINT}/{user_id}", json=kc_payload)

    async def reset_password(self, user_id: str, new_password: str) -> None:
        await self.find_by_id(user_id)
        payload = {"type": "password", "value": new_password, "temporary": False}
        await self.client.put(f"{self._USERS_ENDPOINT}/{user_id}/reset-password", json=payload)

    async def disable(self, user_id: str) -> None:
        await self.find_by_id(user_id)
        await self.client.put(f"{self._USERS_ENDPOINT}/{user_id}", json={"enabled": False})