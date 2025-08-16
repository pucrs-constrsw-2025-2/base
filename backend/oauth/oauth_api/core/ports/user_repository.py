from abc import ABC, abstractmethod
from typing import Optional, List
from oauth_api.core.domain.user import User


class IUserRepository(ABC):
    @abstractmethod
    async def find_by_id(self, user_id: str) -> Optional[User]:
        raise NotImplementedError

    @abstractmethod
    async def find_all(self, enabled: Optional[bool] = None) -> List[User]:
        raise NotImplementedError

    @abstractmethod
    async def create(self, user_data: dict) -> User:
        raise NotImplementedError

    @abstractmethod
    async def update(self, user_id: str, user_data: dict) -> None:
        raise NotImplementedError

    @abstractmethod
    async def reset_password(self, user_id: str, new_password: str) -> None:
        raise NotImplementedError

    @abstractmethod
    async def disable(self, user_id: str) -> None:
        raise NotImplementedError
