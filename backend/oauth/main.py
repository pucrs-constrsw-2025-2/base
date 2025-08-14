from fastapi import FastAPI, HTTPException, Header, Response
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import requests
import re
import os
from dotenv import load_dotenv
from typing import Annotated, Optional



# Carregar as variáveis de ambiente do arquivo .env
load_dotenv()

app = FastAPI()



# Variáveis de ambiente carregadas
KEYCLOAK_URL = os.getenv("KEYCLOAK_URL")  # Exemplo: http://localhost:8080
REALM_NAME = os.getenv("REALM_NAME")  # Exemplo: constrsw
CLIENT_ID = os.getenv("CLIENT_ID")  # Exemplo: oauth
CLIENT_SECRET = os.getenv("CLIENT_SECRET")

# Modelo Pydantic para os dados do usuário
class User(BaseModel):
    username: str
    password: str
    first_name: str
    last_name: str

# Modelo para atualização de usuário (password opcional)
class UserUpdate(BaseModel):
    username: str
    first_name: str
    last_name: str
    password: Optional[str] = None  # Password opcional para update

class LoginRequest(BaseModel):
    username: str
    password: str

# Modelo para a resposta do token
class TokenResponse(BaseModel):
    token_type: str
    access_token: str
    expires_in: int
    refresh_token: str
    refresh_expires_in: int

# Função para obter o token de acesso do Keycloak
def get_keycloak_token(username: str, password: str):
    """
    Obtém um token de acesso do Keycloak usando o password grant.
    """
    if not username or not password:
        # 400 - Bad Request se username ou password não forem fornecidos
        raise HTTPException(status_code=400, detail="Username e/ou password não informados")
    
    url = f"{KEYCLOAK_URL}/realms/{REALM_NAME}/protocol/openid-connect/token"
    
    # Dados do corpo (form-data)
    data = {
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET,
        'username': username,
        'password': password,
        'grant_type': 'password',
    }
    
    # Fazendo a requisição POST para obter o token
    response = requests.post(url, data=data)

    # Verifica se a resposta foi bem-sucedida
    if response.status_code != 200:
        # 401 - Unauthorized se as credenciais estiverem incorretas
        raise HTTPException(status_code=401, detail="Username e/ou password inválidos")
    
    # Retorna o corpo JSON com os tokens
    return response.json()

# Endpoint de login para autenticação de usuários via OAuth
@app.post("/login", response_model=TokenResponse)
async def login(login_request: LoginRequest):
    """
    Endpoint para autenticar o usuário via OAuth e obter o access token
    """
    # Verifica se username e password foram informados
    if not login_request.username or not login_request.password:
        raise HTTPException(status_code=400, detail="Username e/ou password não informados")
    
    # Obtém o token do Keycloak
    token = get_keycloak_token(login_request.username, login_request.password)
    
    # Retorna o token como resposta
    return token

# ===== ALTERAÇÃO 1: usar regex simples (compilada) para validar e-mail =====
EMAIL_VALIDATION_RE = re.compile(
    r"^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@([A-Za-z0-9-]+\.)+[A-Za-z]{2,}$"
)

# ===== ALTERAÇÃO 2: manter APENAS o TEXTO da RFC 5322 para exibir na mensagem (não compilar) =====
EMAIL_RFC_TEXT = (
    r"([-!#-'*+/-9=?A-Z^-~]+(\.[-!#-'*+/-9=?A-Z^-~]+)*|"
    r"\"([]!#-[^-~ \t]|(\\(\t -~]))+\")@"
    r"([-!#-'*+/-9=?A-Z^-~]+(\.[-!#-'*+/-9=?A-Z^-~]+)*|"
    r"\([\t -Z^-~]*])"
)

# Função para criar um novo usuário no Keycloak
def create_keycloak_user(access_token: str, user: User):
    """
    Função para criar um novo usuário no Keycloak utilizando o token de acesso.
    """
    url = f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/users"
    headers = {
        'Authorization': access_token,  # mantém como veio (ex.: "Bearer xxx")
        'Content-Type': 'application/json'
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
            raise HTTPException(status_code=500, detail="User created but ID not returned by Keycloak")
        user_id = location_header.rstrip("/").split("/")[-1]
        # 201 - Created (mensagem exatamente como pedido)
        return JSONResponse(
            status_code=201,
            content={
                "message": "User created successfully",
                "user": {
                    "id": user_id,
                    "username": user.username,
                    "first-name": user.first_name,
                    "last-name": user.last_name,
                    "enabled": True
                }
            }
        )

    if response.status_code == 401:
        # 401 - Unauthorized
        raise HTTPException(status_code=401, detail="Access token inválido")

    if response.status_code == 403:
        # 403 - Forbidden
        raise HTTPException(status_code=403, detail="access token não concede permissão para acessar esse endpoint")

    if response.status_code == 409:
        # 409 - Conflict
        raise HTTPException(status_code=409, detail="Username já existente")

    # 400 ou quaisquer outros erros de requisição -> Bad Request com texto exigido
    raise HTTPException(status_code=400, detail="Erro na estrutura da chamada (headers, request body etc.)")

# Endpoint para criar um novo usuário no Keycloak
@app.post("/users")
async def create_user(user: User, authorization: Annotated[str | None, Header()] = None):
    # Validação do header Authorization como "Bearer ..."
    if not authorization or not authorization.startswith("Bearer "):
        # 401 - Unauthorized
        raise HTTPException(status_code=401, detail="Access token inválido")

    # ===== ALTERAÇÃO 3: usar a regex simples para validar e-mail =====
    if not EMAIL_VALIDATION_RE.fullmatch(user.username or ""):
        # 400 - Bad Request com a mensagem exata e a regex da RFC 5322 em TEXTO
        raise HTTPException(
            status_code=400,
            detail=(
                "E-mail inválido - RFC 5322 official standard regular expression to validate email addresses: \n"
                + EMAIL_RFC_TEXT
            ),
        )

    """
    Endpoint para criar um novo usuário no Keycloak, passando o token de acesso no cabeçalho.
    """
    # Chama a função para criar o usuário no Keycloak
    # Observação: create_keycloak_user já retorna JSONResponse(201) em caso de sucesso
    result = create_keycloak_user(authorization, user)
    if isinstance(result, JSONResponse):
        return result  # 201 - Created com corpo exigido

    # Fallback (não deve ocorrer, mas garante mensagem uniforme)
    return JSONResponse(status_code=201, content=result)


@app.get("/users")
async def list_users(
    authorization: Annotated[str | None, Header()] = None,
    enabled: bool | None = None  # parâmetro opcional de query
):
    # Valida token
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Access token inválido")

    # Monta URL base do Keycloak
    url = f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/users"
    params = {}
    if enabled is not None:
        params["enabled"] = str(enabled).lower()

    headers = {
        "Authorization": authorization,
        "Content-Type": "application/json"
    }

    # Faz a requisição para o Keycloak
    response = requests.get(url, headers=headers, params=params)

    if response.status_code == 200:
        # Mapeia apenas os campos que você quer retornar
        kc_users = response.json()
        result = [
            {
                "id": u.get("id"),
                "username": u.get("username"),
                "first-name": u.get("firstName"),
                "last-name": u.get("lastName"),
                "enabled": u.get("enabled"),
            }
            for u in kc_users
        ]
        return JSONResponse(status_code=200, content=result)

    if response.status_code == 401:
        raise HTTPException(status_code=401, detail="Access token inválido")

    if response.status_code == 403:
        raise HTTPException(
            status_code=403,
            detail="Access token não concede permissão para acessar esse endpoint ou objeto"
        )

    raise HTTPException(status_code=400, detail="Erro na estrutura do request (headers, request body etc.)")

@app.get("/users/{user_id}")
async def get_user(user_id: str, authorization: Annotated[str | None, Header()] = None):
    # 401 - Unauthorized
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Access token inválido")

    url = f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/users/{user_id}"
    headers = {
        "Authorization": authorization,
        "Content-Type": "application/json",
    }

    response = requests.get(url, headers=headers)

    if response.status_code == 200:
        kc_user = response.json()
        result = {
            "id": kc_user.get("id", user_id),
            "username": kc_user.get("username"),
            "first-name": kc_user.get("firstName"),
            "last-name": kc_user.get("lastName"),
            "enabled": kc_user.get("enabled"),
        }
        return JSONResponse(status_code=200, content=result)

    if response.status_code == 401:
        raise HTTPException(status_code=401, detail="Access token inválido")

    if response.status_code == 403:
        raise HTTPException(
            status_code=403,
            detail="Access token não concede permissão para acessar esse endpoint ou objeto",
        )

    if response.status_code == 404:
        raise HTTPException(status_code=404, detail="Objeto não localizado")

    # 400 - Bad Request (qualquer outra falha de chamada)
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
        "Authorization": access_token,  # ex.: "Bearer xxx"
        "Content-Type": "application/json",
    }
    data = {"enabled": False}

    response = requests.put(url, json=data, headers=headers)

    if response.status_code == 204:
        return  # sucesso, sem corpo

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

# ---- endpoint DELETE /users/{id} ----
@app.delete("/users/{user_id}")
async def delete_user(user_id: str, authorization: Annotated[str | None, Header()] = None):
    # Header Authorization deve ser Bearer
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Access token inválido")

    # Chama o helper para desabilitar o usuário (exclusão lógica)
    disable_keycloak_user(authorization, user_id)

    # 204 No Content com corpo vazio
    return Response(status_code=204)

@app.put("/users/{user_id}")
async def update_user(
    user_id: str,
    user_update: UserUpdate,
    authorization: Annotated[str | None, Header()] = None
):
    # Verifica se o token é válido
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Access token inválido")

    # Monta a URL para o Keycloak
    url = f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/users/{user_id}"

    # Headers para a requisição
    headers = {
        "Authorization": authorization,
        "Content-Type": "application/json"
    }

    # Corpo da requisição com os dados atualizados
    data = {
        "username": user_update.username,
        "firstName": user_update.first_name,
        "lastName": user_update.last_name
    }

    # Faz a chamada PUT para atualizar os dados principais
    response = requests.put(url, headers=headers, json=data)

    if response.status_code == 204:
         #Se a senha também foi enviada, atualiza em outra chamada
#        if user_update.password:
#            pw_url = f"{url}/reset-password"
#            pw_data = {
#                "type": "password",
#                "temporary": False,
#                "value": user_update.password
#            }
#
#            pw_response = requests.put(pw_url, headers=headers, json=pw_data)
#            if pw_response.status_code != 204:
#                raise HTTPException(
#                     status_code=400,
#                    detail="Usuário atualizado, mas falha ao definir a nova senha"
#                )

        return Response(status_code=200)  # Sucesso total

    if response.status_code == 401:
        raise HTTPException(status_code=401, detail="Access token inválido")

    if response.status_code == 403:
        raise HTTPException(
            status_code=403,
            detail="Access token não concede permissão para acessar esse endpoint ou objeto"
        )

    if response.status_code == 404:
        raise HTTPException(status_code=404, detail="Objeto não localizado")

    raise HTTPException(
        status_code=400,
        detail="Erro na estrutura da chamada (headers, request body etc.)"
    )
