from oauth_api.core.ports.role_repository import IRoleRepository
from oauth_api.core.exceptions import BaseAPIException


class RoleNotFoundError(BaseAPIException):
    status_code = 404
    error_code = "OA-404"
    description = "Role não localizada"


class RoleService:
    def __init__(self, role_repo: IRoleRepository):
        self.role_repo = role_repo

    async def get_by_name_or_fail(self, role_name: str):
        role = await self.role_repo.find_by_name(role_name)
        if not role:
            raise RoleNotFoundError()
        return role

    async def delete_or_fail(self, role_name: str):
        await self.get_by_name_or_fail(role_name)
        await self.role_repo.delete(role_name)
