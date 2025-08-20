from typing import Optional, List, Dict
from oauth_api.core.domain.user import User
from oauth_api.core.ports.user_repository import IUserRepository
from oauth_api.core.exceptions import UserNotFoundError, UserAlreadyExistsError, KeycloakAPIError
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
        params = {"email": email, "exact": "true"}
        kc_users = await self.client.get("/users", params=params)
        if not kc_users:
            return None
        return self._to_domain(kc_users[0])

    async def find_all(self, enabled: Optional[bool] = None) -> List[User]:
        # Passo 1: Busca a lista completa de usuários do Keycloak,
        # já que o filtro enabled=true não é suportado por eles.
        kc_users = await self.client.get("/users")
        
        # Converte a resposta do Keycloak para a nossa lista de objetos de domínio User.
        all_users = [self._to_domain(user) for user in kc_users]

        # Passo 2: Se o filtro 'enabled' não foi passado, retorna a lista completa.
        if enabled is None:
            return all_users

        # Passo 3: Se o filtro foi passado (True ou False),
        # a filtragem é feita aqui, na memória da nossa aplicação.
        filtered_users = [user for user in all_users if user.enabled == enabled]
        
        return filtered_users

    async def create(self, user_data: dict) -> User:
        kc_payload = {
            "username": user_data["username"],
            "email": user_data["username"],
            "firstName": user_data["first_name"],
            "lastName": user_data["last_name"],
            "enabled": True,
            "credentials": [{"type": "password", "value": user_data["password"], "temporary": False}],
        }
        try:
            response = await self.client.post("/users", json=kc_payload)
            user_location = response.headers.get("location")
            if not user_location:
                raise KeycloakAPIError(500, "Header 'Location' não encontrado.")
            user_id = user_location.split("/")[-1]
            return await self.find_by_id(user_id)
        except KeycloakAPIError as e:
            if e.status_code == 409:
                raise UserAlreadyExistsError() from e
            raise

    async def update(self, user_id: str, user_data: dict) -> User:
        existing_user = await self.find_by_id(user_id)
        if not existing_user:
            raise UserNotFoundError()
        
        kc_payload = {
            "firstName": user_data.get("first_name", existing_user.first_name),
            "lastName": user_data.get("last_name", existing_user.last_name),
        }
        await self.client.put(f"/users/{user_id}", json=kc_payload)
        return await self.find_by_id(user_id)

    async def reset_password(self, user_id: str, new_password: str) -> None:
        await self.find_by_id(user_id)
        payload = {"type": "password", "value": new_password, "temporary": False}
        await self.client.put(f"/users/{user_id}/reset-password", json=payload)

    async def disable(self, user_id: str) -> None:
        await self.find_by_id(user_id)
        await self.client.put(f"/users/{user_id}", json={"enabled": False})