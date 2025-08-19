from oauth_api.core.ports.user_repository import IUserRepository
from oauth_api.core.ports.role_repository import IRoleRepository
from oauth_api.core.exceptions import UserNotFoundError
from .role_service import RoleNotFoundError
from oauth_api.core.exceptions import UserNotFoundError, UserAlreadyExistsError
from oauth_api.core.domain.user import User


class UserService:
    def __init__(self, user_repo: IUserRepository, role_repo: IRoleRepository):
        self.user_repo = user_repo
        self.role_repo = role_repo
        
    async def create_user(self, user_data: dict) -> User:
        """
        Cria um novo usuário após validar se o e-mail já existe.
        """
        # O campo 'username' no Keycloak é usado para o e-mail.
        existing_user = await self.user_repo.find_by_email(user_data["username"])
        if existing_user:
            raise UserAlreadyExistsError(f"User with email {user_data['username']} already exists")
        return await self.user_repo.create(user_data)

    async def find_user_by_id(self, user_id: str) -> User:
        """
        Busca um usuário pelo seu ID, levantando uma exceção se não for encontrado.
        """
        user = await self.user_repo.find_by_id(user_id)
        if not user:
            raise UserNotFoundError(f"User with id {user_id} not found")
        return user
    
    async def find_all(self, enabled: bool | None = None) -> list[User]:
        """Busca todos os usuários, com um filtro opcional."""
        return await self.user_repo.find_all(enabled=enabled)

    async def update_user(self, user_id: str, update_data: dict):
        """Atualiza os dados de um usuário."""
        await self.find_user_by_id(user_id) # Garante que o usuário existe
        await self.user_repo.update(user_id, update_data)

    async def reset_password(self, user_id: str, new_password: str):
        """Reseta a senha de um usuário."""
        await self.find_user_by_id(user_id) # Garante que o usuário existe
        await self.user_repo.reset_password(user_id, new_password)

    async def disable_user(self, user_id: str):
        """Desativa um usuário."""
        await self.find_user_by_id(user_id) # Garante que o usuário existe
        await self.user_repo.disable(user_id)

    # Isso aqui n faz sentido, devia ta no role_service!!
    
    # async def assign_role_to_user(self, user_id: str, role_name: str) -> None:
    #     await self._check_user_exists(user_id)
    #     role = await self.role_repo.find_by_name(role_name)
    #     if not role:
    #         raise RoleNotFoundError()
    #     await self.role_repo.add_to_user(user_id, [role])

    # async def remove_role_from_user(self, user_id: str, role_name: str) -> None:
    #     await self._check_user_exists(user_id)
    #     role = await self.role_repo.find_by_name(role_name)
    #     if not role:
    #         raise RoleNotFoundError()
    #     await self.role_repo.remove_from_user(user_id, [role])

    # async def _check_user_exists(self, user_id: str) -> None:
    #     user = await self.user_repo.find_by_id(user_id)
    #     if not user:
    #         raise UserNotFoundError()
