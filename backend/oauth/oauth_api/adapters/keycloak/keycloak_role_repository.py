# Onde: oauth_api/adapters/db/keycloak_role_repository.py

import asyncio
from typing import Any, Dict, List, Optional

from oauth_api.core.domain.role import Role
from oauth_api.core.exceptions import KeycloakAPIError, NotFoundError
from oauth_api.core.ports.role_repository import IRoleRepository
from oauth_api.config import settings  # Importar settings
from .keycloak_client import KeycloakAdminClient


class KeycloakRoleRepository(IRoleRepository):
    def __init__(self, client: KeycloakAdminClient):
        self.client = client
        self._client_uuid: Optional[str] = None  # Cache para o UUID do client

    async def _get_client_uuid(self) -> str:
        """Busca e armazena em cache o UUID interno do client a partir do client_id."""
        if self._client_uuid:
            return self._client_uuid

        params = {"clientId": settings.KEYCLOAK_CLIENT_ID}
        clients_list = await self.client.get("/clients", params=params)

        if not clients_list:
            raise KeycloakAPIError(
                500,
                f"Client com clientId '{settings.KEYCLOAK_CLIENT_ID}' não encontrado.",
            )

        self._client_uuid = clients_list[0]["id"]
        return self._client_uuid

    def _to_domain(self, kc_role: Dict) -> Role:
        """Converte a representação do Keycloak para o modelo de domínio."""
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
        """
        Busca um client role pelo seu ID.
        Como a API não suporta busca direta por ID, listamos todos e filtramos.
        """
        all_roles = await self.find_all()
        for role in all_roles:
            if role.id == role_id:
                return role
        return None

    async def find_by_name(self, role_name: str) -> Role | None:
        """Busca um client role pelo seu nome."""
        try:
            client_uuid = await self._get_client_uuid()
            kc_role = await self.client.get(f"/clients/{client_uuid}/roles/{role_name}")
            return self._to_domain(kc_role)
        except KeycloakAPIError as e:
            if e.status_code == 404:
                return None
            raise

    async def find_all(self, enabled: Optional[bool] = None) -> List[Role]:
        """Busca todos os client roles."""
        client_uuid = await self._get_client_uuid()
        kc_roles_list = await self.client.get(f"/clients/{client_uuid}/roles")

        all_roles = [self._to_domain(role) for role in kc_roles_list]

        if enabled is None:
            return all_roles

        return [role for role in all_roles if role.enabled == enabled]

    async def find_roles_by_user_id(self, user_id: str) -> list[Role]:
        """Busca os client roles de um usuário no Keycloak."""
        try:
            client_uuid = await self._get_client_uuid()
            # O endpoint agora aponta para os mappings de client
            kc_roles = await self.client.get(
                f"/users/{user_id}/role-mappings/clients/{client_uuid}"
            )

            # A lógica para buscar detalhes e filtrar por 'enabled' permanece útil
            detailed_roles = []
            tasks = [self.find_by_name(role_mapping["name"]) for role_mapping in kc_roles]
            results = await asyncio.gather(*tasks)
            
            for role_details in results:
                if role_details and role_details.enabled:
                    detailed_roles.append(role_details)

            return detailed_roles
        except KeycloakAPIError as e:
            if e.status_code == 404:
                raise NotFoundError(f"Usuário com ID '{user_id}' não encontrado.") from e
            raise

    async def create(self, role_data: Any) -> Role:
        """Cria um novo client role com o atributo 'enabled'."""
        client_uuid = await self._get_client_uuid()
        kc_payload = {
            "name": role_data["name"],
            "description": role_data.get("description"),
            "attributes": {"enabled": [str(role_data.get("enabled", True)).lower()]},
        }
        await self.client.post(f"/clients/{client_uuid}/roles", json=kc_payload)

        created_role = await self.find_by_name(role_data["name"])
        if not created_role:
            raise KeycloakAPIError(500, "Não foi possível recuperar o role recém-criado.")
        return created_role

    async def update(self, role_id: str, role_data: dict[str, Any]) -> Role:
        """Atualiza os dados de um client role, incluindo o atributo 'enabled'."""
        role_to_update = await self.find_by_id(role_id)
        if not role_to_update:
            raise NotFoundError(f"Role com ID '{role_id}' não encontrado.")

        updated_role_data = role_to_update.model_copy(update=role_data)
        kc_payload = updated_role_data.model_dump(include={"name", "description"})
        kc_payload["attributes"] = {"enabled": [str(updated_role_data.enabled).lower()]}
        
        client_uuid = await self._get_client_uuid()
        # O endpoint de update para client roles usa o NOME do role, não o ID.
        await self.client.put(
            f"/clients/{client_uuid}/roles/{role_to_update.name}", json=kc_payload
        )

        # Retorna os dados atualizados
        return updated_role_data


    async def delete(self, role_id: str) -> bool:
        """Realiza a deleção lógica do role, definindo 'enabled' como False."""
        try:
            await self.update(role_id, {"enabled": False})
            return True
        except KeycloakAPIError as e:
            if e.status_code == 404:
                return False
            raise
        except Exception:
            return False

    async def add_roles_to_user(self, user_id: str, roles: List[Role]) -> None:
        """Adiciona client roles a um usuário."""
        client_uuid = await self._get_client_uuid()
        kc_roles = [{"id": role.id, "name": role.name} for role in roles]
        await self.client.post(
            f"/users/{user_id}/role-mappings/clients/{client_uuid}", json=kc_roles
        )

    async def remove_roles_from_user(self, user_id: str, roles: List[Role]) -> None:
        """Remove client roles de um usuário."""
        client_uuid = await self._get_client_uuid()
        kc_roles = [{"id": role.id, "name": role.name} for role in roles]
        await self.client.delete(
            f"/users/{user_id}/role-mappings/clients/{client_uuid}", json=kc_roles
        )