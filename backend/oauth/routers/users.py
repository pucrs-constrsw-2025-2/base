import re
from typing import Annotated
import requests

from fastapi import APIRouter, Header, Response, Body
from models.user import UserCreate, UserUpdate, TokenResponse, LoginRequest
from services.keycloak_service import (
    get_keycloak_token,
    create_keycloak_user,
    disable_keycloak_user,
)
from exceptions import APIException
from config import KEYCLOAK_URL, REALM_NAME

router = APIRouter(prefix="/users", tags=["users"])

# Constante para a origem do erro e helper de validação de token
ERROR_SOURCE = "UserRouter"
EMAIL_VALIDATION_RE = re.compile(r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$")

def _validate_token(authorization: str | None):
    """Função auxiliar para validar o header de autorização."""
    if not authorization or not authorization.startswith("Bearer "):
        raise APIException(
            status_code=401,
            error_code="AUTH-401-01",
            description="Header de autorização 'Bearer' ausente ou mal formatado.",
            source=ERROR_SOURCE,
        )

# --- Endpoints ---

@router.post("/login", response_model=TokenResponse)
async def login(login_request: LoginRequest):
    """Endpoint para autenticar o usuário e obter o access token."""
    # A chamada de serviço já valida os campos e levanta APIException em caso de falha
    token_data = get_keycloak_token(login_request.username, login_request.password)
    return token_data

@router.post("/", response_model=dict, status_code=201)
async def create_user(user: UserCreate, authorization: Annotated[str | None, Header()] = None):
    """Endpoint para criar um novo usuário no Keycloak."""
    _validate_token(authorization)
    
    if not EMAIL_VALIDATION_RE.fullmatch(user.email or ""):
        raise APIException(
            status_code=400,
            error_code="VALID-400-01",
            description="O formato do e-mail fornecido é inválido.",
            source=ERROR_SOURCE,
        )

    new_user_data = create_keycloak_user(authorization, user)
    return new_user_data

@router.get("/", response_model=list)
async def list_users(authorization: Annotated[str | None, Header()] = None, enabled: bool | None = None):
    """Lista usuários do Keycloak (lógica mantida no router)."""
    _validate_token(authorization)
    
    url = f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/users"
    params = {}
    if enabled is not None:
        params["enabled"] = str(enabled).lower()
    headers = {"Authorization": authorization, "Content-Type": "application/json"}

    try:
        response = requests.get(url, headers=headers, params=params)
        
        if response.status_code == 200:
            return response.json() # Retorna a lista de usuários diretamente

        # Tratamento de erros da requisição
        error_map = {
            401: "Access token inválido ou expirado.",
            403: "Ação não permitida. Verifique as permissões do token.",
        }
        description = error_map.get(response.status_code, "Erro ao listar usuários.")
        raise APIException(
            status_code=response.status_code,
            error_code=f"KC-{response.status_code}",
            description=description,
            source=ERROR_SOURCE
        )
    except requests.exceptions.RequestException as e:
        raise APIException(status_code=503, error_code="KC-CONN-ERR", description=f"Erro de comunicação com o Keycloak: {e}", source=ERROR_SOURCE)

@router.get("/{user_id}", response_model=dict)
async def get_user(user_id: str, authorization: Annotated[str | None, Header()] = None):
    """Busca um usuário pelo ID (lógica mantida no router)."""
    _validate_token(authorization)

    url = f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/users/{user_id}"
    headers = {"Authorization": authorization, "Content-Type": "application/json"}

    try:
        response = requests.get(url, headers=headers)

        if response.status_code == 200:
            return response.json()

        error_map = {
            401: "Access token inválido ou expirado.",
            403: "Ação não permitida para este usuário.",
            404: "Usuário não localizado.",
        }
        description = error_map.get(response.status_code, "Erro ao buscar usuário.")
        raise APIException(status_code=response.status_code, error_code=f"KC-{response.status_code}", description=description, source=ERROR_SOURCE)
    except requests.exceptions.RequestException as e:
        raise APIException(status_code=503, error_code="KC-CONN-ERR", description=f"Erro de comunicação com o Keycloak: {e}", source=ERROR_SOURCE)


@router.delete("/{user_id}", status_code=204)
async def delete_user(user_id: str, authorization: Annotated[str | None, Header()] = None):
    """Desabilita um usuário (exclusão lógica)."""
    _validate_token(authorization)
    disable_keycloak_user(authorization, user_id)
    return Response(status_code=204)

@router.put("/{user_id}", status_code=204)
async def update_user(user_id: str, user_update: UserUpdate, authorization: Annotated[str | None, Header()] = None):
    """Atualiza dados de um usuário (lógica mantida no router)."""
    _validate_token(authorization)
    
    url = f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/users/{user_id}"
    headers = {"Authorization": authorization, "Content-Type": "application/json"}
    # Usamos dict() para converter o modelo Pydantic em um dicionário para o JSON
    data = user_update.dict()
    # Adicionamos manualmente os campos que não estão no modelo UserUpdate mas são necessários
    data["enabled"] = True
    data["credentials"] = [{"type": "password", "value": user_update.password, "temporary": False}]

    try:
        response = requests.put(url, headers=headers, json=data)
        if response.status_code == 204:
            return Response(status_code=204)

        error_map = {
            401: "Access token inválido ou expirado.",
            403: "Ação não permitida para este usuário.",
            404: "Usuário não localizado.",
        }
        description = error_map.get(response.status_code, "Erro ao atualizar usuário.")
        raise APIException(status_code=response.status_code, error_code=f"KC-{response.status_code}", description=description, source=ERROR_SOURCE)
    except requests.exceptions.RequestException as e:
        raise APIException(status_code=503, error_code="KC-CONN-ERR", description=f"Erro de comunicação com o Keycloak: {e}", source=ERROR_SOURCE)

@router.patch("/{user_id}", status_code=204)
async def update_password(user_id: str, body: dict = Body(...), authorization: Annotated[str | None, Header()] = None):
    """Atualiza a senha de um usuário (lógica mantida no router)."""
    _validate_token(authorization)
    
    password = body.get("password")
    if not password:
        raise APIException(status_code=400, error_code="VALID-400-02", description="O campo 'password' é obrigatório.", source=ERROR_SOURCE)

    url = f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/users/{user_id}/reset-password"
    headers = {"Authorization": authorization, "Content-Type": "application/json"}
    data = {"type": "password", "value": password, "temporary": False}

    try:
        response = requests.put(url, json=data, headers=headers)
        if response.status_code == 204:
            return Response(status_code=204)

        error_map = {
            401: "Access token inválido ou expirado.",
            403: "Ação não permitida para este usuário.",
            404: "Usuário não localizado.",
        }
        description = error_map.get(response.status_code, "Erro ao atualizar a senha.")
        raise APIException(status_code=response.status_code, error_code=f"KC-{response.status_code}", description=description, source=ERROR_SOURCE)
    except requests.exceptions.RequestException as e:
        raise APIException(status_code=503, error_code="KC-CONN-ERR", description=f"Erro de comunicação com o Keycloak: {e}", source=ERROR_SOURCE)