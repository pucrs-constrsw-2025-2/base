# Onde: oauth_api/adapters/db/keycloak_role_repository.py

import asyncio
from typing import Any, Dict, List, Optional

from oauth_api.core.domain.role import Role
from oauth_api.core.exceptions import KeycloakAPIError, NotFoundError
from oauth_api.core.ports.role_repository import IRoleRepository

from .keycloak_client import KeycloakAdminClient


class KeycloakRoleRepository(IRoleRepository):
    def __init__(self, client: KeycloakAdminClient):
        self.client = client

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

    async def find_all(self, enabled: Optional[bool] = None) -> List[Role]:
        """
        Busca todos os roles e seus detalhes completos para garantir que o status
        'enabled' esteja correto. Permite filtrar por esse status.
        """
        # 1. Busca a lista de papéis (representação simplificada)
        kc_roles_list = await self.client.get("/roles")

        # 2. Cria uma lista de tarefas para buscar os detalhes de cada papel em paralelo
        tasks = [self.find_by_name(role.get("name", "")) for role in kc_roles_list if role.get("name")]
        
        # 3. Executa todas as buscas em paralelo e aguarda os resultados
        detailed_roles_results = await asyncio.gather(*tasks)

        # 4. Filtra quaisquer resultados None (caso um papel tenha sido removido entre as chamadas)
        all_roles = [role for role in detailed_roles_results if role is not None]

        # 5. Aplica o filtro 'enabled' se ele foi fornecido
        if enabled is None:
            return all_roles

        return [role for role in all_roles if role.enabled == enabled]
    
    async def find_roles_by_user_id(self, user_id: str) -> list[Role]:
        """Busca os roles de um usuário no Keycloak."""
        try:
            # O endpoint role-mappings/realm retorna os roles de realm atribuídos ao usuário
            kc_roles = await self.client.get(f"/users/{user_id}/role-mappings/realm")
            
            # Precisamos buscar os detalhes de cada role para obter o atributo 'enabled'
            detailed_roles = []
            for role_mapping in kc_roles:
                role_details = await self.find_by_name(role_mapping["name"])
                if role_details and role_details.enabled:
                    detailed_roles.append(role_details)

            return detailed_roles
        except KeycloakAPIError as e:
            if e.status_code == 404:
                raise NotFoundError(f"Usuário com ID '{user_id}' não encontrado.") from e
            raise

    async def create(self, role_data: Any) -> Role:
        """Cria um novo role com o atributo 'enabled'."""
        kc_payload = {
            "name": role_data["name"],
            "description": role_data.get("description"),
            "attributes": {
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
            
            kc_payload = updated_role_data.model_dump(include={"name", "description"})
            
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
            await self.update(role_id, {"enabled": False})
            return True
        except KeycloakAPIError as e:
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