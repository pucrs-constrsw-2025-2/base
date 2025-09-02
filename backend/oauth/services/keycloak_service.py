import requests
from models.user import UserCreate, UserUpdate
from config import CLIENT_ID, CLIENT_SECRET, KEYCLOAK_URL, REALM_NAME
from exceptions import APIException  # Usando o nome final 'APIException'

# Constante para a origem do erro, facilitando a manutenção
ERROR_SOURCE = "KeycloakService"
ERROR_USER_OR_PASS = "Username e/ou password inválidos"
APPLICATION_JSON = "application/json"


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
        # Fazendo a requisição POST para obter o token
        response = requests.post(url, data=data)

        if response.status_code != 200:
            # Tenta extrair a mensagem de erro específica do Keycloak
            kc_error_detail = response.json().get(
                "error_description", ERROR_USER_OR_PASS
            )
            raise APIException(
                status_code=response.status_code,
                error_code=f"KC-{response.status_code}",  # Repassa o código de erro do Keycloak
                description=kc_error_detail,
                source=ERROR_SOURCE,
            )

        # Em caso de sucesso, retorna o JSON com o token
        return response.json()

    except requests.exceptions.RequestException as e:
        # Captura erros de conexão (ex: Keycloak fora do ar)
        raise APIException(
            status_code=503,  # Service Unavailable
            error_code="KS-503-01",
            description=f"Erro de comunicação com o serviço de autenticação: {e}",
            source=ERROR_SOURCE,
        )


def create_keycloak_user(access_token: str, user_create: UserCreate):
    """
    Cria um novo usuário no Keycloak.
    Retorna um dicionário com os dados do usuário em sucesso.
    Levanta APIException em caso de falha.
    """
    url = f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/users"
    headers = {"Authorization": access_token, "Content-Type": APPLICATION_JSON}
    data = {
        "username": user_create.username,
        "firstName": user_create.first_name,
        "lastName": user_create.last_name,
        "email": user_create.email,
        "enabled": True,
        "credentials": [cred.dict() for cred in user_create.credentials],
    }

    try:
        response = requests.post(url, json=data, headers=headers)

        if response.status_code == 201:
            location_header = response.headers.get("Location")
            if not location_header:
                raise APIException(
                    status_code=500,
                    error_code="KC-500-01",
                    description="Usuário criado mas ID não foi retornado pelo Keycloak",
                    source=ERROR_SOURCE,
                )
            user_id = location_header.rstrip("/").split("/")[-1]

            # Retorna um dicionário em vez de JSONResponse
            return {
                "message": "User created successfully",
                "user": {
                    "id": user_id,
                    "username": user_create.username,
                    "firstName": user_create.first_name,
                    "lastName": user_create.last_name,
                    "enabled": True,
                },
            }

        # Tratamento centralizado para outros códigos de erro
        error_details = response.json().get("errorMessage", response.reason)
        error_map = {
            401: "Access token inválido ou expirado.",
            403: "Ação não permitida. Verifique as permissões do token.",
            409: f"Conflito: Usuário ou email já existente. (Detalhe: {error_details})",
        }
        description = error_map.get(
            response.status_code, f"Erro do Keycloak: {error_details}"
        )

        raise APIException(
            status_code=response.status_code,
            error_code=f"KC-{response.status_code}",
            description=description,
            source=ERROR_SOURCE,
        )
    except requests.exceptions.RequestException as e:
        raise APIException(
            status_code=503,
            error_code="KS-503-02",
            description=f"Erro de comunicação com o serviço de autenticação: {e}",
            source=ERROR_SOURCE,
        )


def disable_keycloak_user(access_token: str, user_id: str):
    """
    Desabilita (enabled=False) um usuário no Keycloak (exclusão lógica).
    Levanta APIException em caso de falha.
    """
    url = f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/users/{user_id}"
    headers = {"Authorization": access_token, "Content-Type": APPLICATION_JSON}
    data = {"enabled": False}

    try:
        response = requests.put(url, json=data, headers=headers)

        if response.status_code == 204:
            return  # Sucesso, sem conteúdo para retornar

        # Tratamento de erros
        error_map = {
            401: "Access token inválido ou expirado.",
            403: "Ação não permitida para este usuário.",
            404: "Usuário não localizado.",
        }
        description = error_map.get(
            response.status_code, "Erro ao desabilitar usuário."
        )

        raise APIException(
            status_code=response.status_code,
            error_code=f"KC-{response.status_code}",
            description=description,
            source=ERROR_SOURCE,
        )
    except requests.exceptions.RequestException as e:
        raise APIException(
            status_code=503,
            error_code="KS-503-03",
            description=f"Erro de comunicação com o serviço de autenticação: {e}",
            source=ERROR_SOURCE,
        )


def update_keycloak_user_data(access_token: str, user_id: str, user_update: UserUpdate):
    """
    Atualiza dados de um usuário no Keycloak (PUT/PATCH).
    Levanta APIException em caso de falha.
    """
    url = f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/users/{user_id}"
    headers = {"Authorization": access_token, "Content-Type": APPLICATION_JSON}

    # Prepara o payload para o Keycloak, excluindo a senha
    data = user_update.model_dump(exclude_unset=True, exclude={"password"})

    # Adiciona os campos extras como enabled e credentials
    data["enabled"] = True

    # Se a senha foi informada, adiciona ela ao campo 'credentials'
    if user_update.password:
        data["credentials"] = [
            {"type": "password", "value": user_update.password, "temporary": False}
        ]

    if "first_name" in data:
        data["firstName"] = data.pop("first_name")
    if "last_name" in data:
        data["lastName"] = data.pop("last_name")

    try:
        # Envia a requisição PUT para atualizar o usuário
        response = requests.put(url, json=data, headers=headers)
        print(
            "ERROR RESPONSE:", response.text
        )  # Log do corpo da resposta para depuração

        if response.status_code == 204:
            # Status 204: Sucesso, mas sem conteúdo para retornar
            return None  # Pode retornar None ou uma mensagem vazia

        # Caso o código não seja 204, trata o erro do Keycloak
        kc_error_detail = response.json().get("error_description", ERROR_USER_OR_PASS)
        raise APIException(
            status_code=response.status_code,
            error_code=f"KC-{response.status_code}",
            description=kc_error_detail,
            source=ERROR_SOURCE,
        )

    except requests.exceptions.RequestException as e:
        # Em caso de erro de comunicação, lança a exceção 503
        raise APIException(
            status_code=503,
            error_code="KS-503-03",
            description=f"Erro de comunicação com o serviço de autenticação: {e}",
            source=ERROR_SOURCE,
        )


def update_keycloak_user_password(access_token: str, user_id: str, password: str):
    """
    Atualiza a senha de um usuário no Keycloak.
    Levanta APIException em caso de falha.
    """
    url = f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/users/{user_id}/reset-password"
    headers = {"Authorization": access_token, "Content-Type": APPLICATION_JSON}
    data = {"type": "password", "value": password, "temporary": False}

    try:
        response = requests.put(url, json=data, headers=headers)
        if response.status_code != 204:
            # Tenta extrair a mensagem de erro específica do Keycloak
            kc_error_detail = response.json().get(
                "error_description", ERROR_USER_OR_PASS
            )
            raise APIException(
                status_code=response.status_code,
                error_code=f"KC-{response.status_code}",  # Repassa o código de erro do Keycloak
                description=kc_error_detail,
                source=ERROR_SOURCE,
            )
        return None

    except requests.exceptions.RequestException as e:
        raise APIException(
            status_code=503,
            error_code="KS-503-03",
            description=f"Erro de comunicação com o serviço de autenticação: {e}",
            source=ERROR_SOURCE,
        )
