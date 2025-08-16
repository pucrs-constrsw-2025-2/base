import requests
from fastapi import HTTPException
from fastapi.responses import JSONResponse
from config import KEYCLOAK_URL, REALM_NAME
from models.role import RoleCreate, RoleUpdate, UserRoleAssign


def get_headers(access_token: str):
    return {
        "Authorization": access_token,
        "Content-Type": "application/json",
    }


def create_role(access_token: str, role_create: RoleCreate):
    url = f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/roles"
    response = requests.post(
        url, json=role_create.dict(), headers=get_headers(access_token)
    )
    if response.status_code == 201:
        return JSONResponse(
            status_code=201,
            content={"message": "Role criada com sucesso", "role": role_create.dict()},
        )
    if response.status_code == 409:
        raise HTTPException(status_code=409, detail="Role já existe")
    if response.status_code == 401:
        raise HTTPException(status_code=401, detail="Access token inválido")
    raise HTTPException(status_code=400, detail="Erro ao criar role")


def list_roles(access_token: str):
    url = f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/roles"
    response = requests.get(url, headers=get_headers(access_token))
    if response.status_code == 200:
        return response.json()
    if response.status_code == 401:
        raise HTTPException(status_code=401, detail="Access token inválido")
    raise HTTPException(status_code=400, detail="Erro ao listar roles")


def get_role(access_token: str, role_name: str):
    url = f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/roles/{role_name}"
    response = requests.get(url, headers=get_headers(access_token))
    if response.status_code == 200:
        return response.json()
    if response.status_code == 404:
        raise HTTPException(status_code=404, detail="Role não encontrada")
    raise HTTPException(status_code=400, detail="Erro ao buscar role")


def update_role(access_token: str, role_name: str, role_update: RoleUpdate):
    url = f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/roles/{role_name}"
    response = requests.put(
        url,
        json=role_update.dict(exclude_unset=True),
        headers=get_headers(access_token),
    )
    if response.status_code == 204:
        return JSONResponse(status_code=200, content={"message": "Role atualizada"})
    if response.status_code == 404:
        raise HTTPException(status_code=404, detail="Role não encontrada")
    raise HTTPException(status_code=400, detail="Erro ao atualizar role")


def delete_role(access_token: str, role_name: str):
    url = f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/roles/{role_name}"
    response = requests.delete(url, headers=get_headers(access_token))
    if response.status_code == 204:
        return JSONResponse(status_code=200, content={"message": "Role excluída"})
    if response.status_code == 404:
        raise HTTPException(status_code=404, detail="Role não encontrada")
    raise HTTPException(status_code=400, detail="Erro ao excluir role")


def get_headers(access_token: str):
    return {
        "Authorization": access_token,
        "Content-Type": "application/json",
    }


def get_role(access_token: str, role_name: str):
    url = f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/roles/{role_name}"
    response = requests.get(url, headers=get_headers(access_token))
    if response.status_code == 200:
        return response.json()
    if response.status_code == 404:
        raise HTTPException(status_code=404, detail="Role não encontrada")
    raise HTTPException(status_code=400, detail="Erro ao buscar role")


def assign_role_to_user(access_token: str, role_name: str, assign: UserRoleAssign):
    # Busca o objeto completo da role
    role_obj = get_role(access_token, role_name)
    data = [role_obj]
    url = f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/users/{assign.user_id}/role-mappings/realm"
    response = requests.post(url, json=data, headers=get_headers(access_token))
    if response.status_code == 204:
        return JSONResponse(
            status_code=200, content={"message": "Role atribuída ao usuário"}
        )
    raise HTTPException(
        status_code=response.status_code,
        detail=f"Erro ao atribuir role ao usuário: {response.text}",
    )


def unassign_role_from_user(access_token: str, role_name: str, assign: UserRoleAssign):
    # Busca o objeto completo da role
    role_obj = get_role(access_token, role_name)
    data = [role_obj]
    url = f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/users/{assign.user_id}/role-mappings/realm"
    response = requests.delete(url, json=data, headers=get_headers(access_token))
    if response.status_code == 204:
        return JSONResponse(
            status_code=200, content={"message": "Role removida do usuário"}
        )
    raise HTTPException(
        status_code=response.status_code,
        detail=f"Erro ao remover role do usuário: {response.text}",
    )
