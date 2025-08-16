from abc import ABC, abstractmethod
from typing import List, Any
from oauth_api.core.domain.role import Role


class IRoleRepository(ABC):
    @abstractmethod
    async def find_by_name(self, role_name: str) -> Role | None:
        raise NotImplementedError

    @abstractmethod
    async def find_all(self) -> List[Role]:
        raise NotImplementedError

    @abstractmethod
    async def create(self, role_data: Any) -> Role:
        raise NotImplementedError

    @abstractmethod
    async def update(self, role_name: str, role_data: Any) -> Role:
        raise NotImplementedError

    @abstractmethod
    async def delete(self, role_name: str) -> None:
        raise NotImplementedError

    @abstractmethod
    async def add_to_user(self, user_id: str, roles: List[Role]) -> None:
        raise NotImplementedError

    @abstractmethod
    async def remove_from_user(self, user_id: str, roles: List[Role]) -> None:
        raise NotImplementedError
