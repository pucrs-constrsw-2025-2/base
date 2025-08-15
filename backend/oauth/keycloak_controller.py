import requests
from fastapi import HTTPException
from fastapi.responses import JSONResponse
from models import User, UserCreate
from globals import CLIENT_ID, CLIENT_SECRET, KEYCLOAK_URL, REALM_NAME


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
def create_keycloak_user(access_token: str, userCreate: UserCreate):
    """
    Função para criar um novo usuário no Keycloak utilizando o token de acesso.
    """
    url = f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/users"
    headers = {
        "Authorization": access_token,  # mantém como veio (ex.: "Bearer xxx")
        "Content-Type": "application/json",
    }
    data = {
        "username": userCreate.username,
        "firstName": userCreate.first_name,
        "lastName": userCreate.last_name,
        "email": userCreate.email,
        "enabled": True,
        "credentials": [cred.dict() for cred in userCreate.credentials],
    }

    response = requests.post(url, json=data, headers=headers)

    if response.status_code == 201:
        location_header = response.headers.get("Location")
        if not location_header:
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
                    "username": userCreate.username,
                    "firstName": userCreate.first_name,
                    "lastName": userCreate.last_name,
                    "enabled": True,
                },
            },
        )

    # Tratamento de outros códigos de erro
    if response.status_code == 401:
        raise HTTPException(status_code=401, detail="Access token inválido")
    if response.status_code == 403:
        raise HTTPException(
            status_code=403,
            detail="Access token não concede permissão para acessar esse endpoint",
        )
    if response.status_code == 409:
        raise HTTPException(status_code=409, detail="Username já existente")

    # Erro genérico para outras falhas
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
