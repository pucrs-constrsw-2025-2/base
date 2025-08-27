from typing import Any, Dict, List

from oauth_api.core.domain.role import Role
from oauth_api.core.exceptions import KeycloakAPIError, NotFoundError
from oauth_api.core.ports.role_repository import IRoleRepository

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

    # NOVO: Método find_by_id implementado
    async def find_by_id(self, role_id: str) -> Role | None:
        """Busca um role pelo seu ID único."""
        try:
            # A API Admin do Keycloak usa o endpoint 'roles-by-id' para buscar por ID
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
        kc_roles = await self.client.get("/roles")
        return [self._to_domain(role) for role in kc_roles]

    async def create(self, role_data: Any) -> Role:
        # A API do Keycloak espera um payload JSON simples para criar um role
        kc_payload = {
            "name": role_data["name"],
            "description": role_data.get(
                "description"
            ),  # .get() é mais seguro para campos opcionais
        }
        await self.client.post("/roles", json=kc_payload)

        created_role = await self.find_by_name(role_data["name"])
        if not created_role:
            raise KeycloakAPIError(
                500, "Não foi possível recuperar o role recém-criado."
            )
        return created_role

    async def update(self, role_id: str, role_data: dict[str, Any]) -> Role:
        """
        Atualiza os dados de um role no Keycloak (implementa a lógica de PATCH).
        """
        try:
            # 1. Buscar o estado atual do role
            role_to_update = await self.find_by_id(role_id)
            if not role_to_update:
                raise NotFoundError(f"Role com ID '{role_id}' não encontrado.")

            # 2. Mesclar os dados existentes com os novos dados parciais
            # O Pydantic nos ajuda a fazer isso de forma segura
            updated_role_data = role_to_update.model_copy(update=role_data)

            # O payload para o Keycloak é um dicionário simples
            kc_payload = updated_role_data.model_dump(include={"name", "description"})

            # 3. Enviar o objeto completo para o Keycloak
            await self.client.put(f"/roles-by-id/{role_id}", json=kc_payload)

            # Retorna o objeto de domínio atualizado
            return updated_role_data
        except Exception as e:
            raise KeycloakAPIError(
                status_code=500, description=f"Erro ao atualizar role: {e}"
            )

    async def delete(self, role_id: str) -> bool:
        # O ideal é usar o ID do role para a exclusão
        await self.client.delete(f"/roles-by-id/{role_id}")
        return True

    # RENOMEADO: de add_to_user para add_roles_to_user
    async def add_roles_to_user(self, user_id: str, roles: List[Role]) -> None:
        kc_roles = [{"id": role.id, "name": role.name} for role in roles]
        await self.client.post(f"/users/{user_id}/role-mappings/realm", json=kc_roles)

    # RENOMEADO: de remove_from_user para remove_roles_from_user
    async def remove_roles_from_user(self, user_id: str, roles: List[Role]) -> None:
        kc_roles = [{"id": role.id, "name": role.name} for role in roles]
        # O método HTTP para remover mappings é DELETE
        await self.client.delete(f"/users/{user_id}/role-mappings/realm", json=kc_roles)
