from oauth_api.core.exceptions import ConflictAlreadyExistsError, NotFoundError
from oauth_api.core.ports.role_repository import IRoleRepository
from oauth_api.core.domain.role import Role

class RoleService:
    """Serviço contendo a lógica de negócio para roles."""

    def __init__(self, role_repository: IRoleRepository):
        self.role_repository = role_repository

    async def create_role(self, role_data: dict) -> Role:
        """Cria um novo role, garantindo que o nome não seja duplicado."""
        existing_role = await self.role_repository.find_by_name(role_data["name"])
        if existing_role:
            raise ConflictAlreadyExistsError(f"Role com o nome '{role_data['name']}' já existe.")
        return await self.role_repository.create(role_data)

    async def get_all_roles(self) -> list[Role]:
        """Retorna uma lista de todos os roles."""
        return await self.role_repository.find_all()

    async def get_role_by_id(self, role_id: str) -> Role:
        """Busca um role pelo ID. Lança exceção se não encontrado."""
        role = await self.role_repository.find_by_id(role_id)
        if not role:
            raise NotFoundError(f"Role com ID '{role_id}' não encontrado.")
        return role

    async def update_role(self, role_id: str, update_data: dict) -> Role:
        """Atualiza completamente um role."""
        await self.get_role_by_id(role_id)  # Garante que o role existe
        updated_role = await self.role_repository.update(role_id, update_data)
        if not updated_role:
             raise NotFoundError(f"Não foi possível atualizar o role com ID '{role_id}'.")
        return updated_role

    async def partial_update_role(self, role_id: str, update_data: dict) -> Role:
        """Atualiza parcialmente um role."""
        await self.get_role_by_id(role_id) # Garante que o role existe
        # Remove chaves com valor None para não sobrescrever campos existentes
        update_payload = {k: v for k, v in update_data.items() if v is not None}
        if not update_payload:
            return await self.get_role_by_id(role_id) # Se nada for enviado, retorna o role atual

        updated_role = await self.role_repository.update(role_id, update_payload)
        if not updated_role:
             raise NotFoundError(f"Não foi possível atualizar o role com ID '{role_id}'.")
        return updated_role

    async def delete_role(self, role_id: str) -> None:
        """Deleta um role."""
        await self.get_role_by_id(role_id) # Garante que o role existe
        success = await self.role_repository.delete(role_id)
        if not success:
            raise NotFoundError(f"Não foi possível deletar o role com ID '{role_id}'.")

    async def assign_roles_to_user(self, user_id: str, role_ids: list[str]) -> None:
        """Atribui um ou mais roles a um usuário."""
        # A implementação do repositório de usuário deveria verificar se o user_id existe
        roles_to_assign = []
        for role_id in role_ids:
            role = await self.get_role_by_id(role_id)
            roles_to_assign.append(role)

        if roles_to_assign:
            await self.role_repository.add_roles_to_user(user_id, roles_to_assign)

    async def remove_roles_from_user(self, user_id: str, role_ids: list[str]) -> None:
        """Remove um ou mais roles de um usuário."""
        roles_to_remove = []
        for role_id in role_ids:
            role = await self.get_role_by_id(role_id)
            roles_to_remove.append(role)

        if roles_to_remove:
            await self.role_repository.remove_roles_from_user(user_id, roles_to_remove)