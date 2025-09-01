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

def test_create_user_success(auth_token):
    # Cria um nome de usuário único para o teste
    unique_username = f"testuser_{uuid.uuid4().hex}"
    
    payload = {
        "username": unique_username,
        "first_name": "New",
        "last_name": "User",
        "email": f"{unique_username}@example.com",
        "credentials": [{"type": "password", "value": "newpassword", "temporary": False}]
    }

    response = client.post(
        "/users", json=payload, headers=auth_token
    )
    assert response.status_code == 201


def test_create_user_failure_existing_user(auth_token):
    # Tenta criar um usuário com nome que já existe para forçar um erro de conflito
    unique_username = f"existing_user_{uuid.uuid4().hex}"
    
    client.post(
        "/users",
        json={
            "username": unique_username,
            "first_name": "Existing",
            "last_name": "User",
            "email": f"{unique_username}@example.com",
            "credentials": [{"type": "password", "value": "password123", "temporary": False}]
        },
        headers=auth_token
    )
    
    response = client.post(
        "/users",
        json={
            "username": unique_username,
            "first_name": "Existing",
            "last_name": "User",
            "email": f"{unique_username}@example.com",
            "credentials": [{"type": "password", "value": "password123", "temporary": False}]
        },
        headers=auth_token
    )

    assert response.status_code == 409
    assert "Conflito: Usuário ou email já existente. (Detalhe: User exists with same email)" in response.json().get("detail")
    
def test_update_password_success(auth_token):
    # Cria um usuário para ser atualizado
    username_to_update = f"update_user_{uuid.uuid4().hex}"
    create_response = client.post(
        "/users",
        json={
            "username": username_to_update,
            "first_name": "Update",
            "last_name": "User",
            "email": f"{username_to_update}@example.com",
            "credentials": [{"type": "password", "value": "password123", "temporary": False}]
        },
        headers=auth_token,
    )
    user_id = create_response.json()["user"]["id"]
    
    # Atualiza a senha do usuário
    response = client.patch(
        f"/users/{user_id}",
        json={"password": "new_updated_password"},
        headers=auth_token,
    )
    
    assert response.status_code == 204

def test_put_user_success(auth_token):
    # Cria um usuário para ser substituído
    username_to_put = f"put_user_{uuid.uuid4().hex}"
    create_response = client.post(
        "/users",
        json={
            "username": username_to_put,
            "first_name": "Original",
            "last_name": "User",
            "email": f"{username_to_put}@example.com",
            "credentials": [{"type": "password", "value": "password123", "temporary": False}]
        },
        headers=auth_token,
    )
    user_id = create_response.json()["user"]["id"]
    
    # Payload completo para substituir o usuário
    payload = {
        "username": username_to_put,
        "first_name": "Replaced",
        "last_name": "User",
        "email": f"replaced_{username_to_put}@example.com",
        "password": "newpassword"
    }

    response = client.put(
        f"/users/{user_id}",
        json=payload,
        headers=auth_token,
    )
    
    assert response.status_code == 204
