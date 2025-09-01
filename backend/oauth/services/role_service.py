import requests
from config import KEYCLOAK_URL, REALM_NAME
from models.role import RoleCreate, RoleUpdate, UserRoleAssign
from exceptions import APIException  # Usando o nome final 'APIException'

# Constante para a origem do erro, facilitando a manutenção
ERROR_SOURCE = "RoleService"

def get_headers(access_token: str):
    """Cria os headers padrão para as requisições."""
    return {"Authorization": access_token, "Content-Type": "application/json"}

def _handle_keycloak_error(response: requests.Response, context: str):
    """Função auxiliar para tratar e levantar erros comuns do Keycloak de forma padronizada."""
    error_map = {
        401: "Access token inválido ou expirado.",
        403: "Ação não permitida. Verifique as permissões do token.",
        404: f"O recurso solicitado para '{context}' não foi encontrado.",
        409: f"Conflito ao '{context}'. O recurso provavelmente já existe.",
    }
    error_details = response.json().get("errorMessage", response.reason)
    description = error_map.get(response.status_code, f"Erro inesperado ao {context}: {error_details}")
    
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
        error_code="RS-503-01",
        description=f"Erro de comunicação com o Keycloak ao {context}: {exception}",
        source=ERROR_SOURCE,
    )

def create_role(access_token: str, role_create: RoleCreate):
    """Cria uma nova role e retorna os dados, incluindo o ID da role criada."""
    url = f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/roles"
    context = "criar role"
    
    try:
        # Cria a role
        response = requests.post(url, json=role_create.dict(), headers=get_headers(access_token))

        # Verifica se a criação foi bem-sucedida
        if response.status_code == 201:
            # Requisição para obter os detalhes da role criada, incluindo o ID
            get_url = f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/roles/{role_create.dict()['name']}"
            response_get = requests.get(get_url, headers=get_headers(access_token))

            if response_get.status_code == 200:
                role_data = response_get.json()
                role_create_dict = role_create.dict()
                role_create_dict['id'] = role_data.get('id')  # Adiciona o ID da role na resposta
                return role_create_dict  # Retorna a role criada com o ID
                
            _handle_keycloak_error(response_get, "obter detalhes da role")
        
        _handle_keycloak_error(response, context)
    
    except requests.exceptions.RequestException as e:
        _handle_request_exception(e, context)

def list_roles(access_token: str):
    """Lista todas as roles."""
    url = f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/roles"
    context = "listar roles"
    try:
        response = requests.get(url, headers=get_headers(access_token))
        if response.status_code == 200:
            return response.json()
        _handle_keycloak_error(response, context)
    except requests.exceptions.RequestException as e:
        _handle_request_exception(e, context)

def get_role_by_id(access_token: str, role_id: str):
    """Busca uma role pelo seu ID."""
    url = f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/roles-by-id/{role_id}"
    context = f"buscar role com ID {role_id}"
    try:
        response = requests.get(url, headers=get_headers(access_token))
        if response.status_code == 200:
            return response.json()
        _handle_keycloak_error(response, context)
    except requests.exceptions.RequestException as e:
        _handle_request_exception(e, context)

def update_role(access_token: str, role_id: str, role_update: RoleUpdate):
    """Atualiza uma role (PUT)."""
    url = f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/roles-by-id/{role_id}"
    context = f"atualizar role com ID {role_id}"
    try:
        # Garante que a role existe antes de tentar atualizar
        get_role_by_id(access_token, role_id)
        
        response = requests.put(url, json=role_update.dict(), headers=get_headers(access_token))
        if response.status_code == 204:
            return  # Sucesso, sem conteúdo
        _handle_keycloak_error(response, context)
    except APIException as e:
        # Repassa exceções de get_role_by_id ou do próprio PUT
        raise e
    except requests.exceptions.RequestException as e:
        _handle_request_exception(e, context)
        
def patch_role(access_token: str, role_id: str, role_update: RoleUpdate):
    """Atualiza parcialmente uma role (PATCH simulado)."""
    context = f"atualizar parcialmente role com ID {role_id}"
    try:
        existing_role_data = get_role_by_id(access_token, role_id)
        update_data = role_update.dict(exclude_unset=True)
        existing_role_data.update(update_data)

        url = f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/roles-by-id/{role_id}"
        response = requests.put(url, json=existing_role_data, headers=get_headers(access_token))
        
        if response.status_code == 204:
            return # Sucesso
        _handle_keycloak_error(response, context)
    except APIException as e:
        raise e
    except requests.exceptions.RequestException as e:
        _handle_request_exception(e, context)

def logical_delete_role(access_token: str, role_id: str):
    """Realiza a exclusão lógica de uma role."""
    context = f"desativar role com ID {role_id}"
    try:
        role_to_update = get_role_by_id(access_token, role_id)
        
        if "attributes" not in role_to_update:
            role_to_update["attributes"] = {}
        role_to_update["attributes"]["isActive"] = ["false"]

        url = f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/roles-by-id/{role_id}"
        response = requests.put(url, json=role_to_update, headers=get_headers(access_token))
        
        if response.status_code == 204:
            return # Sucesso
        _handle_keycloak_error(response, context)
    except APIException as e:
        raise e
    except requests.exceptions.RequestException as e:
        _handle_request_exception(e, context)

def physical_delete_role(access_token: str, role_id: str):
    """Realiza a exclusão física de uma role."""
    url = f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/roles-by-id/{role_id}"
    context = f"excluir fisicamente role com ID {role_id}"
    try:
        response = requests.delete(url, headers=get_headers(access_token))
        if response.status_code == 204:
            return # Sucesso
        _handle_keycloak_error(response, context)
    except requests.exceptions.RequestException as e:
        _handle_request_exception(e, context)

def assign_role_to_user(access_token: str, role_id: str, assign: UserRoleAssign):
    """Atribui uma role a um usuário."""
    context = f"atribuir role {role_id} ao usuário {assign.user_id}"
    try:
        role_obj = get_role_by_id(access_token, role_id)
        
        # Validação de regra de negócio
        attributes = role_obj.get("attributes", {})
        is_active_values = attributes.get("isActive", ["true"])
        if "false" in is_active_values:
            raise APIException(
                status_code=400,
                error_code="RS-400-01", # Erro de regra de negócio específico
                description="Não é possível atribuir um role que está desativado (excluído logicamente).",
                source=ERROR_SOURCE
            )

        data = [role_obj]
        url = f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/users/{assign.user_id}/role-mappings/realm"
        response = requests.post(url, json=data, headers=get_headers(access_token))
        if response.status_code == 204:
            return # Sucesso
        _handle_keycloak_error(response, context)
    except APIException as e:
        raise e
    except requests.exceptions.RequestException as e:
        _handle_request_exception(e, context)

def unassign_role_from_user(access_token: str, role_id: str, assign: UserRoleAssign):
    """Remove uma role de um usuário."""
    context = f"remover role {role_id} do usuário {assign.user_id}"
    try:
        role_obj = get_role_by_id(access_token, role_id)
        data = [role_obj]
        
        url = f"{KEYCLOAK_URL}/admin/realms/{REALM_NAME}/users/{assign.user_id}/role-mappings/realm"
        response = requests.delete(url, json=data, headers=get_headers(access_token))
        if response.status_code == 204:
            return # Sucesso
        _handle_keycloak_error(response, context)
    except APIException as e:
        raise e
    except requests.exceptions.RequestException as e:
        _handle_request_exception(e, context)