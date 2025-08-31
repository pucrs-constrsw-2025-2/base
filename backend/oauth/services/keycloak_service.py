import re
import requests
from typing import Annotated, Optional, List
from models.user import UserCreate
from config import KEYCLOAK_URL, REALM_NAME, CLIENT_ID, CLIENT_SECRET
from exceptions import APIException

# Constante para a origem do erro, facilitando a manutenção
ERROR_SOURCE = "KeycloakService"


def _handle_keycloak_error(response: requests.Response, context: str):
    """Função auxiliar para tratar e levantar erros comuns do Keycloak de forma padronizada."""
    error_map = {
        401: "Access token inválido ou expirado.",
        403: "Ação não permitida. Verifique as permissões do token.",
        404: f"O recurso solicitado para '{context}' não foi encontrado.",
        409: f"Conflito ao '{context}'. O recurso provavelmente já existe.",
    }
    # Tenta extrair a mensagem de erro específica do Keycloak
    try:
        error_details = response.json().get("errorMessage", response.reason)
    except requests.exceptions.JSONDecodeError:
        error_details = response.reason
        
    description = error_map.get(response.status_code, f"Erro do Keycloak: {error_details}")
    
    raise APIException(
        status_code=response.status_code,
        error_code=f"KC-{response.status_code}",
        description=description,
        source=ERROR_SOURCE,
    )

def _handle_request_exception(exception: requests.exceptions.RequestException, context: str):
    """Função auxiliar para tratar erros de conexão com o Keycloak."""
    raise APIException(
        status_code=503, # Service Unavailable
        error_code="KS-503-01",
        description=f"Erro de comunicação com o serviço de autenticação: {exception}",
        source=ERROR_SOURCE,
    )

def get_keycloak_token(username: str, password: str):
    """
    Obtém um token de acesso do Keycloak usando o password grant.
    Levanta APIException em caso de falha.
    """
    if not username or not password:
        raise APIException(
            status_code=400,
            error_code="KS-400-01",
            description="Username e/ou password não informados",
            source=ERROR_SOURCE,
        )

    url = f"{KEYCLOAK_URL}/realms/{REALM_NAME}/protocol/openid-connect/token"
    data = {
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "username": username,
        "password": password,
        "grant_type": "password",
    }

    try:
        response = requests.post(url, data=data)

        if response.status_code != 200:
            kc_error_detail = response.json().get("error_description", "Username e/ou password inválidos")
            raise APIException(
                status_code=response.status_code,
                error_code=f"KC-{response.status_code}",
                description=kc_error_detail,
                source=ERROR_SOURCE
            )
        return response.json()

    except requests.exceptions.RequestException as e:
        _handle_request_exception(e, "obter token")

def create_keycloak_user(access_token: str, userCreate: UserCreate):
    """
    Cria um novo usuário no Keycloak.
    Levanta APIException em caso de falha.
    """
    url = f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/users"
    headers = {"Authorization": access_token, "Content-Type": "application/json"}
    data = {
        "username": userCreate.username,
        "firstName": userCreate.first_name,
        "lastName": userCreate.last_name,
        "email": userCreate.email,
        "enabled": True,
        "credentials": [cred.dict() for cred in userCreate.credentials],
    }

    try:
        response = requests.post(url, json=data, headers=headers)

        if response.status_code == 201:
            return response.json()

        _handle_keycloak_error(response, "criar usuário")
    except requests.exceptions.RequestException as e:
        _handle_request_exception(e, "criar usuário")
        
def update_keycloak_user_data(access_token: str, user_id: str, user_update: dict):
    """
    Atualiza dados de um usuário no Keycloak (PUT/PATCH).
    Levanta APIException em caso de falha.
    """
    url = f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/users/{user_id}"
    headers = {"Authorization": access_token, "Content-Type": "application/json"}
    
    try:
        response = requests.put(url, json=user_update, headers=headers)
        if response.status_code == 204:
            return
        _handle_keycloak_error(response, "atualizar usuário")
    except requests.exceptions.RequestException as e:
        _handle_request_exception(e, "atualizar usuário")

def update_keycloak_user_password(access_token: str, user_id: str, password: str):
    """
    Atualiza a senha de um usuário no Keycloak.
    Levanta APIException em caso de falha.
    """
    url = f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/users/{user_id}/reset-password"
    headers = {"Authorization": access_token, "Content-Type": "application/json"}
    data = {"type": "password", "value": password, "temporary": False}

    try:
        response = requests.put(url, json=data, headers=headers)
        if response.status_code == 204:
            return
        _handle_keycloak_error(response, "atualizar senha do usuário")
    except requests.exceptions.RequestException as e:
        _handle_request_exception(e, "atualizar senha do usuário")


def disable_keycloak_user(access_token: str, user_id: str):
    """
    Desabilita (enabled=False) um usuário no Keycloak (exclusão lógica).
    Levanta APIException em caso de falha.
    """
    url = f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/users/{user_id}"
    headers = {"Authorization": access_token, "Content-Type": "application/json"}
    data = {"enabled": False}

    try:
        response = requests.put(url, json=data, headers=headers)
        if response.status_code == 204:
            return  # Sucesso, sem conteúdo para retornar

        error_map = {
            401: "Access token inválido ou expirado.",
            403: "Ação não permitida para este usuário.",
            404: "Usuário não localizado.",
        }
        description = error_map.get(response.status_code, "Erro ao desabilitar usuário.")
        
        raise APIException(
            status_code=response.status_code,
            error_code=f"KC-{response.status_code}",
            description=description,
            source=ERROR_SOURCE
        )
    except requests.exceptions.RequestException as e:
        raise APIException(
            status_code=503,
            error_code="KS-503-03",
            description=f"Erro de comunicação com o serviço de autenticação: {e}",
            source=ERROR_SOURCE,
        )
