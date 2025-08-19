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


def get_role_by_id(access_token: str, role_id: str):
    # O endpoint do Keycloak para buscar por ID é 'roles-by-id'
    url = f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/roles-by-id/{role_id}"
    response = requests.get(url, headers=get_headers(access_token))
    if response.status_code == 200:
        return response.json()
    if response.status_code == 404:
        raise HTTPException(status_code=404, detail="Role não encontrada")
    raise HTTPException(status_code=400, detail="Erro ao buscar role")


def update_role(access_token: str, role_id: str, role_update: RoleUpdate):
    url = f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/roles-by-id/{role_id}"
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


def patch_role(access_token: str, role_id: str, role_update: RoleUpdate):
    """
    Executa uma atualização parcial (PATCH) seguindo o padrão Read-Modify-Write.
    """
    try:
        # 1. READ: Busca o estado atual e completo do role
        existing_role_data = get_role_by_id(access_token, role_id)

        # 2. MODIFY: Mescla os dados existentes com os novos dados da requisição
        # role_update.dict(exclude_unset=True) cria um dicionário contendo APENAS
        # os campos que foram enviados pelo cliente na requisição PATCH.
        update_data = role_update.dict(exclude_unset=True)

        # O método .update() do dicionário aplica as alterações parciais
        existing_role_data.update(update_data)

        # 3. WRITE: Envia o objeto completo e atualizado para o Keycloak via PUT
        url = f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/roles-by-id/{role_id}"
        response = requests.put(
            url,
            json=existing_role_data,  # Envia o objeto mesclado
            headers=get_headers(access_token),
        )

        if response.status_code == 204:
            return JSONResponse(
                status_code=200,
                content={"message": "Role atualizado com sucesso (PATCH)"},
            )

        # Repassa o erro de forma mais detalhada
        raise HTTPException(
            status_code=response.status_code,
            detail=f"Erro ao atualizar o role no Keycloak: {response.text}",
        )

    except HTTPException as e:
        # Garante que o erro 404 de 'get_role_by_id' seja repassado corretamente
        if e.status_code == 404:
            raise HTTPException(
                status_code=404, detail="Role não encontrado para atualização"
            )
        raise e


# Função para exclusão lógica
def logical_delete_role(access_token: str, role_id: str):
    """
    Realiza a exclusão lógica adicionando um atributo 'isActive: false' ao role.
    """
    try:
        role_to_update = get_role_by_id(access_token, role_id)

        # Adiciona ou atualiza o atributo para marcar como inativo
        if "attributes" not in role_to_update:
            role_to_update["attributes"] = {}
        role_to_update["attributes"]["isActive"] = ["false"]

        # Envia a requisição PUT para atualizar o role com o novo atributo
        url = f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/roles-by-id/{role_id}"
        response = requests.put(
            url, json=role_to_update, headers=get_headers(access_token)
        )

        if response.status_code == 204:
            return JSONResponse(
                status_code=200,
                content={"message": "Role desativada (exclusão lógica)"},
            )
        raise HTTPException(
            status_code=response.status_code, detail="Erro ao desativar role"
        )
    except HTTPException as e:
        if e.status_code == 404:
            raise HTTPException(status_code=404, detail="Role não encontrada")
        raise e


# Opcional: Função para exclusão física
def physical_delete_role(access_token: str, role_id: str):
    url = f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/roles-by-id/{role_id}"
    response = requests.delete(url, headers=get_headers(access_token))
    if response.status_code == 204:
        return JSONResponse(
            status_code=200, content={"message": "Role excluída fisicamente"}
        )
    if response.status_code == 404:
        raise HTTPException(status_code=404, detail="Role não encontrada")
    raise HTTPException(status_code=400, detail="Erro ao excluir role")


# Atribuir role buscando pelo ID
def assign_role_to_user(access_token: str, role_id: str, assign: UserRoleAssign):
    role_obj = get_role_by_id(access_token, role_id)

    # Verifica se o role está ativo
    # Por padrão, se o atributo não existir, consideramos o role ativo.
    # Ele só é inativo se o atributo 'isActive' existir e for explicitamente 'false'.
    attributes = role_obj.get("attributes", {})
    is_active_values = attributes.get(
        "isActive", ["true"]
    )  # Padrão para 'true' se não existir

    if "false" in is_active_values:
        raise HTTPException(
            status_code=400,
            detail="Não é possível atribuir um role que está desativado (excluído logicamente).",
        )

    # Prossegue com a atribuição se a validação passar
    data = [role_obj]
    url = f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/users/{assign.user_id}/role-mappings/realm"
    response = requests.post(url, json=data, headers=get_headers(access_token))

    if response.status_code == 204:
        return JSONResponse(
            status_code=200,
            content={"message": "Role atribuída ao usuário com sucesso"},
        )
    raise HTTPException(
        status_code=response.status_code,
        detail=f"Erro ao atribuir role ao usuário: {response.text}",
    )


# Desatribuir role buscando pelo ID
def unassign_role_from_user(access_token: str, role_id: str, assign: UserRoleAssign):
    # Busca o objeto completo da role pelo ID
    role_obj = get_role_by_id(access_token, role_id)
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
