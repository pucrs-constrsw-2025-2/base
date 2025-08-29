class APIException(Exception):
    """Exceção base para erros na camada de serviço."""
    def __init__(self, status_code: int, error_code: str, description: str, source: str):
        self.status_code = status_code
        self.error_code = error_code
        self.description = description
        self.source = source
        super().__init__(self.description)