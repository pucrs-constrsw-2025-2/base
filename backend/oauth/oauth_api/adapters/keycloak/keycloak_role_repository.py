# Onde: oauth_api/adapters/db/keycloak_role_repository.py

from typing import Any, Dict, List

from oauth_api.core.domain.role import Role
from oauth_api.core.exceptions import KeycloakAPIError, NotFoundError
from oauth_api.core.ports.role_repository import IRoleRepository

from .keycloak_client import KeycloakAdminClient


class KeycloakRoleRepository(IRoleRepository):
    def __init__(self, client: KeycloakAdminClient):
        self.client = client

    def _to_domain(self, kc_role: Dict) -> Role:
        """Converte a representação do Keycloak para o modelo de domínio."""
        # Extrai o atributo 'enabled'. Padrão é 'True' se não existir.
        attributes = kc_role.get("attributes", {})
        enabled_str = attributes.get("enabled", ["true"])[0]
        enabled = enabled_str.lower() == "true"

        return Role(
            id=kc_role.get("id", ""),
            name=kc_role.get("name", ""),
            description=kc_role.get("description"),
            enabled=enabled,
        )

    async def find_by_id(self, role_id: str) -> Role | None:
        """Busca um role pelo seu ID único."""
        try:
            kc_role = await self.client.get(f"/roles-by-id/{role_id}")
            return self._to_domain(kc_role)
        except KeycloakAPIError as e:
            if e.status_code == 404:
                return None
            raise

    async def find_by_name(self, role_name: str) -> Role | None:
        try:
            kc_role = await self.client.get(f"/roles/{role_name}")
            return self._to_domain(kc_role)
        except KeycloakAPIError as e:
            if e.status_code == 404:
                return None
            raise

    async def find_all(self) -> List[Role]:
        """Busca todos os roles e filtra pelos que estão ativos."""
        kc_roles = await self.client.get("/roles")
        all_roles = [self._to_domain(role) for role in kc_roles]
        # Retorna apenas os roles que estão marcados como 'enabled'
        return [role for role in all_roles if role.enabled]

    async def create(self, role_data: Any) -> Role:
        """Cria um novo role com o atributo 'enabled'."""
        kc_payload = {
            "name": role_data["name"],
            "description": role_data.get("description"),
            "attributes": {
                # Armazena o estado 'enabled' como um atributo string
                "enabled": [str(role_data.get("enabled", True)).lower()]
            },
        }
        await self.client.post("/roles", json=kc_payload)

        created_role = await self.find_by_name(role_data["name"])
        if not created_role:
            raise KeycloakAPIError(
                500, "Não foi possível recuperar o role recém-criado."
            )
        return created_role

    async def update(self, role_id: str, role_data: dict[str, Any]) -> Role:
        """Atualiza os dados de um role, incluindo o atributo 'enabled'."""
        try:
            role_to_update = await self.find_by_id(role_id)
            if not role_to_update:
                raise NotFoundError(f"Role com ID '{role_id}' não encontrado.")

            updated_role_data = role_to_update.model_copy(update=role_data)
            
            # Prepara o payload para o Keycloak
            kc_payload = updated_role_data.model_dump(include={"name", "description"})
            
            # Adiciona/Atualiza o atributo 'enabled'
            kc_payload["attributes"] = {
                "enabled": [str(updated_role_data.enabled).lower()]
            }

            await self.client.put(f"/roles-by-id/{role_id}", json=kc_payload)

            return updated_role_data
        except Exception as e:
            raise KeycloakAPIError(
                status_code=500, description=f"Erro ao atualizar role: {e}"
            )

    async def delete(self, role_id: str) -> bool:
        """
        Realiza a deleção lógica do role, definindo 'enabled' como False.
        """
        try:
            # Em vez de deletar, atualizamos o atributo para 'false'
            await self.update(role_id, {"enabled": False})
            return True
        except KeycloakAPIError as e:
            # Se o erro for 404, o role já não existe.
            if e.status_code == 404:
                return False
            raise
        except Exception:
            return False


    async def add_roles_to_user(self, user_id: str, roles: List[Role]) -> None:
        kc_roles = [{"id": role.id, "name": role.name} for role in roles]
        await self.client.post(f"/users/{user_id}/role-mappings/realm", json=kc_roles)


    async def remove_roles_from_user(self, user_id: str, roles: List[Role]) -> None:
        kc_roles = [{"id": role.id, "name": role.name} for role in roles]
        await self.client.delete(f"/users/{user_id}/role-mappings/realm", json=kc_roles)