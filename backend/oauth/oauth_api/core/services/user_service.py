from typing import List, Optional

from oauth_api.core.domain.role import Role # Importar Role
from oauth_api.core.domain.user import User
from oauth_api.core.ports.role_repository import IRoleRepository
from oauth_api.core.ports.user_repository import IUserRepository

from .role_service import NotFoundError


class UserService:
    def __init__(self, user_repo: IUserRepository, role_repo: IRoleRepository):
        self.user_repo = user_repo
        self.role_repo = role_repo

    async def create_user(self, user_data: dict) -> User:
        return await self.user_repo.create(user_data)

    async def find_all(self, enabled: Optional[bool] = None) -> List[User]:
        return await self.user_repo.find_all(enabled)

    async def find_by_id(self, user_id: str) -> Optional[User]:
        return await self.user_repo.find_by_id(user_id)
    
    async def get_user_roles(self, user_id: str) -> list[Role]:
        await self.find_by_id(user_id)
        return await self.role_repo.find_roles_by_user_id(user_id)

    async def update_user(self, user_id: str, user_data: dict) -> None:
        await self.user_repo.update(user_id, user_data)

    async def reset_password(self, user_id: str, new_password: str) -> None:
        await self.user_repo.reset_password(user_id, new_password)

    async def disable_user(self, user_id: str) -> None:
        await self.user_repo.disable(user_id)

    async def assign_role_to_user(self, user_id: str, role_name: str) -> None:
        await self.find_by_id(user_id)
        role = await self.role_repo.find_by_name(role_name)
        if not role:
            raise NotFoundError()
        await self.role_repo.add_roles_to_user(user_id, [role])

    async def remove_role_from_user(self, user_id: str, role_name: str) -> None:
        await self.find_by_id(user_id)
        role = await self.role_repo.find_by_name(role_name)
        if not role:
            raise NotFoundError()
        await self.role_repo.remove_roles_from_user(user_id, [role])