class BaseAPIException(Exception):
    status_code: int = 500
    error_code: str = "OA-500"
    description: str = "Internal Server Error"

    def __init__(self, description: str = "", error_stack: list | None = None):
        if description:
            self.description = description
        self.error_stack = error_stack or []


class KeycloakAPIError(BaseAPIException):
    def __init__(
        self, status_code: int, description: str, error_stack: list | None = None
    ):
        super().__init__(description, error_stack)
        self.status_code = status_code
        self.error_code = f"OA-{status_code}"


class InvalidCredentialsError(BaseAPIException):
    status_code = 401
    error_code = "OA-401"
    description = "username e/ou password inválidos"


class UserNotFoundError(BaseAPIException):
    status_code = 404
    error_code = "OA-404"
    description = "Objeto não localizado"


class UserAlreadyExistsError(BaseAPIException):
    status_code = 409
    error_code = "OA-409"
    description = "Username já existente"


class InvalidTokenError(BaseAPIException):
    status_code = 401
    error_code = "OA-401"
    description = "Access token inválido"
