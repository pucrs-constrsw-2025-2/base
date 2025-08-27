from abc import ABC, abstractmethod

from oauth_api.core.domain.role import Role


class IRoleRepository(ABC):
    """Interface (Port) para o repositório de roles."""

    @abstractmethod
    async def create(self, role_data: dict) -> Role:
        """Cria um novo role na fonte de dados."""
        raise NotImplementedError

    @abstractmethod
    async def find_all(self) -> list[Role]:
        """Retorna todos os roles."""
        raise NotImplementedError

    @abstractmethod
    async def find_by_id(self, role_id: str) -> Role | None:
        """Busca um role pelo seu ID."""
        raise NotImplementedError

    @abstractmethod
    async def find_by_name(self, name: str) -> Role | None:
        """Busca um role pelo seu nome."""
        raise NotImplementedError

    @abstractmethod
    async def update(self, role_id: str, update_data: dict) -> Role | None:
        """Atualiza os dados de um role."""
        raise NotImplementedError

    @abstractmethod
    async def delete(self, role_id: str) -> bool:
        """Deleta um role. Retorna True em caso de sucesso."""
        raise NotImplementedError

    @abstractmethod
    async def add_roles_to_user(self, user_id: str, roles: list[Role]) -> None:
        """Adiciona uma lista de roles a um usuário."""
        raise NotImplementedError

    @abstractmethod
    async def remove_roles_from_user(self, user_id: str, roles: list[Role]) -> None:
        """Remove uma lista de roles de um usuário."""
        raise NotImplementedError
