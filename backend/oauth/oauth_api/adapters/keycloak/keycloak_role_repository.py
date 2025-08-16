from typing import Dict, List, Any
from oauth_api.core.domain.role import Role
from oauth_api.core.ports.role_repository import IRoleRepository
from oauth_api.core.exceptions import KeycloakAPIError
from .keycloak_client import KeycloakAdminClient


class KeycloakRoleRepository(IRoleRepository):
    def __init__(self, client: KeycloakAdminClient):
        self.client = client

    def _to_domain(self, kc_role: Dict) -> Role:
        return Role(
            id=kc_role.get("id", ""),
            name=kc_role.get("name", ""),
            description=kc_role.get("description"),
        )

    async def find_by_name(self, role_name: str) -> Role | None:
        try:
            kc_role = await self.client.get(f"/roles/{role_name}")
            return self._to_domain(kc_role)
        except KeycloakAPIError as e:
            if e.status_code == 404:
                return None
            raise

    async def find_all(self) -> List[Role]:
        kc_roles = await self.client.get("/roles")
        return [self._to_domain(role) for role in kc_roles]

    async def create(self, role_data: Any) -> Role:
        kc_payload = {"name": role_data.name, "description": role_data.description}
        await self.client.post("/roles", json=kc_payload)
        created_role = await self.find_by_name(role_data.name)
        if not created_role:
            raise KeycloakAPIError(
                500, "Não foi possível recuperar o role recém-criado."
            )
        return created_role

    async def update(self, role_name: str, role_data: Any) -> Role:
        kc_payload = {"name": role_data.name, "description": role_data.description}
        await self.client.put(f"/roles/{role_name}", json=kc_payload)
        updated_role = await self.find_by_name(role_data.name)
        if not updated_role:
            raise KeycloakAPIError(
                500, "Não foi possível recuperar o role recém-atualizado."
            )
        return updated_role

    async def delete(self, role_name: str) -> None:
        await self.client.delete(f"/roles/{role_name}")

    async def add_to_user(self, user_id: str, roles: List[Role]) -> None:
        kc_roles = [{"id": role.id, "name": role.name} for role in roles]
        await self.client.post(f"/users/{user_id}/role-mappings/realm", json=kc_roles)

    async def remove_from_user(self, user_id: str, roles: List[Role]) -> None:
        kc_roles = [{"id": role.id, "name": role.name} for role in roles]
        await self.client.delete(f"/users/{user_id}/role-mappings/realm", json=kc_roles)
