import pytest
from fastapi.testclient import TestClient
from main import app
from config import KEYCLOAK_USERNAME, KEYCLOAK_PASSWORD

# Uma instância global do cliente de teste
client = TestClient(app)


@pytest.fixture(scope="session")
def auth_token():
    """
    Fixture que obtém um token de autenticação real do endpoint de login.
    Este token pode ser usado em todos os testes que requerem autenticação.
    """

    response = client.post(
        "/users/login",
        json={
            "username": KEYCLOAK_USERNAME,
            "password": KEYCLOAK_PASSWORD,
        },
    )
    response.raise_for_status()
    token = response.json().get("access_token")
    if not token:
        pytest.fail("Falha ao obter o token de autenticação.")
    return {"Authorization": f"Bearer {token}"}
