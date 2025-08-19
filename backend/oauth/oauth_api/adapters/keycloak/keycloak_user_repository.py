from typing import Optional, List, Dict
from oauth_api.core.domain.user import User
from oauth_api.core.ports.user_repository import IUserRepository
from oauth_api.core.exceptions import (
    UserNotFoundError,
    UserAlreadyExistsError,
    KeycloakAPIError,
)
from .keycloak_client import KeycloakAdminClient


class KeycloakUserRepository(IUserRepository):
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
            kc_user = await self.client.get(f"/users/{user_id}")
            return self._to_domain(kc_user)
        except KeycloakAPIError as e:
            if e.status_code == 404:
                raise UserNotFoundError() from e
            raise
        
    async def find_by_email(self, email: str) -> Optional[User]:
        """
        Finds a user by their exact email address.

        Args:
            email: The email address to search for.

        Returns:
            A User object if found, otherwise None.
        """
        try:
            # Keycloak's API requires query params for searching.
            # 'exact=true' ensures we don't get partial matches.
            params = {"email": email, "exact": "true"}
            kc_users = await self.client.get("/users", params=params)

            # The search endpoint always returns a list.
            # If the list is empty, no user was found.
            if not kc_users:
                return None

            # Since emails should be unique, we return the first result.
            return self._to_domain(kc_users[0])
        except KeycloakAPIError:
            # A failed search usually returns an empty list, not an error.
            # Re-raise any unexpected API errors to be handled upstream.
            raise

    async def find_all(self, enabled: Optional[bool] = None) -> List[User]:
        params = {} if enabled is None else {"enabled": str(enabled).lower()}
        kc_users = await self.client.get("/users", params=params)
        return [self._to_domain(user) for user in kc_users]

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
            response = await self.client.post("/users", json=kc_payload)
            user_location = response.headers.get("location")
            if not user_location:
                raise KeycloakAPIError(
                    500, "Header 'Location' não encontrado na resposta do Keycloak."
                )
            user_id = user_location.split("/")[-1]
            created_user = await self.find_by_id(user_id)
            if not created_user:
                raise KeycloakAPIError(
                    500, "Não foi possível recuperar o usuário recém-criado."
                )
            return created_user
        except KeycloakAPIError as e:
            if e.status_code == 409:
                raise UserAlreadyExistsError() from e
            raise

    async def update(self, user_id: str, user_data: dict) -> None:
        existing_user = await self.find_by_id(user_id)
        if not existing_user:
            raise UserNotFoundError()
        kc_payload = {
            "firstName": user_data.get("first_name", existing_user.first_name),
            "lastName": user_data.get("last_name", existing_user.last_name),
        }
        await self.client.put(f"/users/{user_id}", json=kc_payload)

    async def reset_password(self, user_id: str, new_password: str) -> None:
        await self.find_by_id(user_id)
        payload = {"type": "password", "value": new_password, "temporary": False}
        await self.client.put(f"/users/{user_id}/reset-password", json=payload)

    async def disable(self, user_id: str) -> None:
        if not await self.find_by_id(user_id):
            raise UserNotFoundError()
        await self.client.put(f"/users/{user_id}", json={"enabled": False})
