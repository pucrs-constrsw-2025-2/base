import re
import requests
from typing import Annotated
from dotenv import load_dotenv
from fastapi.responses import JSONResponse
from fastapi import FastAPI, HTTPException, Header, Response
from models.user import (
    UserCreate,
    UserUpdate,
    LoginRequest,
    TokenResponse,
)
from models.role import RoleCreate, RoleUpdate, UserRoleAssign
from keycloak_controller import (
    disable_keycloak_user,
    get_keycloak_token,
    create_keycloak_user,
)
from globals import KEYCLOAK_URL, REALM_NAME
from services.role_service import (
    create_role,
    list_roles,
    get_role,
    update_role,
    delete_role,
    assign_role_to_user,
    unassign_role_from_user,
)

load_dotenv()  # Carregar as variáveis de ambiente do arquivo .env

app = FastAPI()


# Endpoint de login para autenticação de usuários via OAuth
@app.post("/login", response_model=TokenResponse)
async def login(login_request: LoginRequest):
    """
    Endpoint para autenticar o usuário via OAuth e obter o access token
    """
    if not login_request.username or not login_request.password:
        raise HTTPException(
            status_code=400, detail="Username e/ou password não informados"
        )

    token = get_keycloak_token(login_request.username, login_request.password)

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


# Endpoint para criar um novo usuário no Keycloak
@app.post("/users")
async def create_user(
    user: UserCreate, authorization: Annotated[str | None, Header()] = None
):
    # Validação do header Authorization como "Bearer ..."
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Access token inválido")

    # ===== ALTERAÇÃO 3: usar a regex simples para validar e-mail =====
    if not EMAIL_VALIDATION_RE.fullmatch(user.email or ""):
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
    result = create_keycloak_user(authorization, user)
    if isinstance(result, JSONResponse):
        return result  # 201 - Created com corpo exigido

    # Fallback (não deve ocorrer, mas garante mensagem uniforme)
    return JSONResponse(status_code=201, content=result)


@app.get("/users")
async def list_users(
    authorization: Annotated[str | None, Header()] = None,
    enabled: bool | None = None,  # parâmetro opcional de query
):
    # Valida token
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Access token inválido")

    # Monta URL base do Keycloak
    url = f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/users"
    params = {}
    if enabled is not None:
        params["enabled"] = str(enabled).lower()

    headers = {"Authorization": authorization, "Content-Type": "application/json"}

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
            detail="Access token não concede permissão para acessar esse endpoint ou objeto",
        )

    raise HTTPException(
        status_code=400,
        detail="Erro na estrutura do request (headers, request body etc.)",
    )


@app.get("/users/{user_id}")
async def get_user(user_id: str, authorization: Annotated[str | None, Header()] = None):
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

    raise HTTPException(
        status_code=400,
        detail="Erro na estrutura da chamada (headers, request body etc.)",
    )


# ---- endpoint DELETE /users/{id} ----
@app.delete("/users/{user_id}")
async def delete_user(
    user_id: str, authorization: Annotated[str | None, Header()] = None
):
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
    authorization: Annotated[str | None, Header()] = None,
):
    # Verifica se o token é válido
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Access token inválido")

    url = f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/users/{user_id}"

    headers = {"Authorization": authorization, "Content-Type": "application/json"}

    data = {
        "username": user_update.username,
        "firstName": user_update.first_name,  # Certifique-se de que o campo está em camelCase
        "lastName": user_update.last_name,  # Certifique-se de que o campo está em camelCase
        "email": user_update.email,
        "enabled": True,
        "credentials": [
            {"type": "password", "value": user_update.password, "temporary": False}
        ],
    }

    # Faz a chamada PUT para atualizar os dados principais
    response = requests.put(url, headers=headers, json=data)
    print(response)
    if response.status_code == 204:
        # Se a senha também foi enviada, atualiza em outra chamada
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

        return Response(status_code=200)

    if response.status_code == 401:
        raise HTTPException(status_code=401, detail="Access token inválido")

    if response.status_code == 403:
        raise HTTPException(
            status_code=403,
            detail="Access token não concede permissão para acessar esse endpoint ou objeto",
        )

    if response.status_code == 404:
        raise HTTPException(status_code=404, detail="Objeto não localizado")

    raise HTTPException(
        status_code=400,
        detail="Erro na estrutura da chamada (headers, request body etc.)",
    )


@app.post("/roles")
async def create_role_endpoint(
    role: RoleCreate, authorization: Annotated[str | None, Header()] = None
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Access token inválido")
    return create_role(authorization, role)


@app.get("/roles")
async def get_roles_endpoint(authorization: Annotated[str | None, Header()] = None):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Access token inválido")
    return list_roles(authorization)


@app.get("/roles/{role_name}")
async def get_role_endpoint(
    role_name: str, authorization: Annotated[str | None, Header()] = None
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Access token inválido")
    return get_role(authorization, role_name)


@app.put("/roles/{role_name}")
async def update_role_endpoint(
    role_name: str,
    role_update: RoleUpdate,
    authorization: Annotated[str | None, Header()] = None,
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Access token inválido")
    return update_role(authorization, role_name, role_update)


@app.patch("/roles/{role_name}")
async def patch_role_endpoint(
    role_name: str,
    role_update: RoleUpdate,
    authorization: Annotated[str | None, Header()] = None,
):
    # PATCH e PUT são idênticos para Keycloak, ambos usam PUT e ignoram campos não enviados
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Access token inválido")
    return update_role(authorization, role_name, role_update)


@app.delete("/roles/{role_name}")
async def delete_role_endpoint(
    role_name: str, authorization: Annotated[str | None, Header()] = None
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Access token inválido")
    return delete_role(authorization, role_name)


@app.post("/roles/{role_name}/assign")
async def assign_role_endpoint(
    role_name: str,
    assign: UserRoleAssign,
    authorization: Annotated[str | None, Header()] = None,
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Access token inválido")
    return assign_role_to_user(authorization, role_name, assign)


@app.post("/roles/{role_name}/unassign")
async def unassign_role_endpoint(
    role_name: str,
    assign: UserRoleAssign,
    authorization: Annotated[str | None, Header()] = None,
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Access token inválido")
    return unassign_role_from_user(authorization, role_name, assign)
