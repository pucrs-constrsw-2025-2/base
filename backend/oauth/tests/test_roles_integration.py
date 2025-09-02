import pytest
from fastapi.testclient import TestClient
from main import app
import json
import uuid

# Instância global do cliente de teste
client = TestClient(app)


# Note: Este teste requer que o Keycloak esteja rodando e que as credenciais
# para o token de autenticação estejam no 'config.py'.
# As exceções de mock foram removidas para testar a integração real.
def test_create_role_success(auth_token):
    # Tenta criar uma role com um nome único.
    unique_name = f"test_role_{uuid.uuid4().hex}"
    response = client.post(
        "/roles",
        json={"name": unique_name, "description": "Admin role"},
        headers=auth_token,
    )

    assert response.status_code == 201


def test_create_role_failure(auth_token):
    # Tenta criar uma role que já existe para forçar um erro de conflito.
    existing_name = "test_existing_role"
    client.post(
        "/roles",
        json={"name": existing_name, "description": "Admin role"},
        headers=auth_token,
    )

    response = client.post(
        "/roles",
        json={"name": existing_name, "description": "Admin role"},
        headers=auth_token,
    )

    assert response.status_code == 409
    assert "Conflito" in response.json().get("detail")


def test_put_role_success(auth_token):
    # Primeiro, cria uma role para obter um ID.
    unique_name = f"put_test_role_{uuid.uuid4().hex}"
    create_response = client.post(
        "/roles",
        json={"name": unique_name, "description": "Role para testar PUT"},
        headers=auth_token,
    )

    role_id = create_response.json().get("id")

    # Atualiza a role usando o endpoint PUT
    response = client.put(
        f"/roles/{role_id}",
        json={"name": unique_name, "description": "Updated role description"},
        headers=auth_token,
    )

    assert response.status_code == 204


def test_patch_role_success(auth_token):
    # Primeiro, cria uma role para obter um ID.
    unique_name = f"patch_test_role_{uuid.uuid4().hex}"
    create_response = client.post(
        "/roles",
        json={"name": unique_name, "description": "Role para testar PATCH"},
        headers=auth_token,
    )

    role_id = create_response.json().get("id")

    # Atualiza a role usando o endpoint PATCH
    response = client.patch(
        f"/roles/{role_id}",
        json={"description": "Patched role description"},
        headers=auth_token,
    )

    assert response.status_code == 204
