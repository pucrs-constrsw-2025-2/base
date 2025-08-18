from oauth_api.core.ports.user_repository import IUserRepository
from oauth_api.core.ports.role_repository import IRoleRepository
from oauth_api.core.exceptions import UserNotFoundError
from .role_service import RoleNotFoundError


class UserService:
    def __init__(self, user_repo: IUserRepository, role_repo: IRoleRepository):
        self.user_repo = user_repo
        self.role_repo = role_repo

    async def assign_role_to_user(self, user_id: str, role_name: str) -> None:
        await self._check_user_exists(user_id)
        role = await self.role_repo.find_by_name(role_name)
        if not role:
            raise RoleNotFoundError()
        await self.role_repo.add_to_user(user_id, [role])

    async def remove_role_from_user(self, user_id: str, role_name: str) -> None:
        await self._check_user_exists(user_id)
        role = await self.role_repo.find_by_name(role_name)
        if not role:
            raise RoleNotFoundError()
        await self.role_repo.remove_from_user(user_id, [role])

    async def _check_user_exists(self, user_id: str) -> None:
        user = await self.user_repo.find_by_id(user_id)
        if not user:
            raise UserNotFoundError()
