import requests
from fastapi import HTTPException
from fastapi.responses import JSONResponse
from backend.oauth.models import User
from backend.oauth.globals import CLIENT_ID, CLIENT_SECRET, KEYCLOAK_URL, REALM_NAME


# Função para obter o token de acesso do Keycloak
def get_keycloak_token(username: str, password: str):
    """
    Obtém um token de acesso do Keycloak usando o password grant.
    """
    if not username or not password:
        raise HTTPException(
            status_code=400, detail="Username e/ou password não informados"
        )

    url = f"{KEYCLOAK_URL}/realms/{REALM_NAME}/protocol/openid-connect/token"

    data = {
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "username": username,
        "password": password,
        "grant_type": "password",
    }

    # Fazendo a requisição POST para obter o token
    response = requests.post(url, data=data)

    if response.status_code != 200:
        raise HTTPException(status_code=401, detail="Username e/ou password inválidos")

    return response.json()


# Função para criar um novo usuário no Keycloak
def create_keycloak_user(access_token: str, user: User):
    """
    Função para criar um novo usuário no Keycloak utilizando o token de acesso.
    """
    url = f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/users"
    headers = {
        "Authorization": access_token,  # mantém como veio (ex.: "Bearer xxx")
        "Content-Type": "application/json",
    }
    data = {
        "username": user.username,
        "firstName": user.first_name,
        "lastName": user.last_name,
        "enabled": True,
        "email": user.username,
    }
    response = requests.post(url, json=data, headers=headers)

    # Mapeamento explícito de respostas do Keycloak
    if response.status_code == 201:
        location_header = response.headers.get("Location")
        if not location_header:
            # 201 sem Location é erro de infraestrutura
            raise HTTPException(
                status_code=500, detail="User created but ID not returned by Keycloak"
            )
        user_id = location_header.rstrip("/").split("/")[-1]
        return JSONResponse(
            status_code=201,
            content={
                "message": "User created successfully",
                "user": {
                    "id": user_id,
                    "username": user.username,
                    "first-name": user.first_name,
                    "last-name": user.last_name,
                    "enabled": True,
                },
            },
        )

    if response.status_code == 401:
        # 401 - Unauthorized
        raise HTTPException(status_code=401, detail="Access token inválido")

    if response.status_code == 403:
        # 403 - Forbidden
        raise HTTPException(
            status_code=403,
            detail="access token não concede permissão para acessar esse endpoint",
        )

    if response.status_code == 409:
        # 409 - Conflict
        raise HTTPException(status_code=409, detail="Username já existente")

    # 400 ou quaisquer outros erros de requisição -> Bad Request
    raise HTTPException(
        status_code=400,
        detail="Erro na estrutura da chamada (headers, request body etc.)",
    )


# ---- helper para "exclusão lógica" (desabilitar usuário) ----
def disable_keycloak_user(access_token: str, user_id: str):
    """
    Desabilita (enabled=False) um usuário no Keycloak.
    """
    url = f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/users/{user_id}"
    headers = {
        "Authorization": access_token,
        "Content-Type": "application/json",
    }
    data = {"enabled": False}

    response = requests.put(url, json=data, headers=headers)

    if response.status_code == 204:
        return

    if response.status_code == 401:
        raise HTTPException(status_code=401, detail="Access token inválido")

    if response.status_code == 403:
        raise HTTPException(
            status_code=403,
            detail="Access token não concede permissão para acessar esse endpoint ou objeto",
        )

    if response.status_code == 404:
        raise HTTPException(status_code=404, detail="Objeto não localizado")

    # Demais erros de chamada
    raise HTTPException(
        status_code=400,
        detail="Erro na estrutura da chamada (headers, request body etc.)",
    )
