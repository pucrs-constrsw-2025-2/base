use crate::core::dtos::req::login_req::LoginReqKeycloak;
use crate::core::dtos::req::update_user_req::UpdateUserReq;
use crate::core::dtos::res::login_res::LoginResKeycloak;
use crate::core::dtos::req::create_user_req::CreateUserReq;
use crate::core::dtos::res::create_user_res::CreateUserRes;
use crate::core::dtos::res::get_all_users_res::GetUsersRes;
use crate::core::dtos::res::get_user_res::GetUserRes;
use crate::core::dtos::res::get_all_roles_res::GetAllRolesRes;
use crate::core::dtos::res::get_role_res::GetRoleRes;
use crate::core::dtos::req::create_role_req::CreateRoleReq;
use crate::core::interfaces::role_provider::RoleProvider;
use crate::core::interfaces::auth_provider::AuthProvider;
use crate::core::interfaces::user_provider::UserProvider;
use crate::core::error::AppError;
use serde_json::{ json, Value };
use reqwest::Client;
use std::env;

pub struct KeycloakAuthAdapter;
pub struct KeycloakUserAdapter;
pub struct KeycloakRoleAdapter;

#[async_trait::async_trait]
impl AuthProvider for KeycloakAuthAdapter {
    async fn login(&self, req: &LoginReqKeycloak) -> Result<LoginResKeycloak, AppError> {
        let keycloak_url = format!(
            "{}://{}:{}/realms/{}/protocol/openid-connect/token",
            env::var("KEYCLOAK_INTERNAL_PROTOCOL").unwrap(),
            env::var("KEYCLOAK_INTERNAL_HOST").unwrap(),
            env::var("KEYCLOAK_INTERNAL_API_PORT").unwrap(),
            env::var("KEYCLOAK_REALM").unwrap()
        );

        let client = Client::new();
        let response = client
            .post(&keycloak_url)
            .form(req)
            .send()
            .await
            .map_err(|e| AppError::ExternalServiceError { details: e.to_string() })?;

        let status = response.status();
        if status.is_success() {
            response.json::<LoginResKeycloak>().await
                .map_err(|e| AppError::ExternalServiceError { details: format!("Failed to parse Keycloak response: {}", e) })
        } else {
            let error_body = response.text().await.unwrap_or_else(|_| "Could not read error body".to_string());
            match status.as_u16() {
                400 => Err(AppError::ValidationError { details: error_body }),
                401 => Err(AppError::InvalidCredentials),
                _ => Err(AppError::ExternalServiceError { details: error_body }),
            }
        }
    }
}

#[async_trait::async_trait]
impl UserProvider for KeycloakUserAdapter {
    async fn create_user(&self, req: &CreateUserReq, token: &str) -> Result<CreateUserRes, AppError> {
        let keycloak_url = format!(
            "{}://{}:{}/admin/realms/{}/users",
            env::var("KEYCLOAK_INTERNAL_PROTOCOL").unwrap(),
            env::var("KEYCLOAK_INTERNAL_HOST").unwrap(),
            env::var("KEYCLOAK_INTERNAL_API_PORT").unwrap(),
            env::var("KEYCLOAK_REALM").unwrap()
        );

        let user_body = json!({
            "username": req.username,
            "email": req.username,
            "firstName": req.first_name,
            "lastName": req.last_name,
            "enabled": true,
            "credentials": [
                {
                    "type": "password",
                    "value": req.password,
                    "temporary": false
                }
            ]
        });

        let client = Client::new();
        let response = client
            .post(&keycloak_url)
            .header("Authorization", token)
            .json(&user_body)
            .send()
            .await
            .map_err(|e| AppError::ExternalServiceError { details: e.to_string() })?;

        let status = response.status();
        match status.as_u16() {
            201 => {
                let id = response
                    .headers()
                    .get("Location")
                    .and_then(|v| v.to_str().ok())
                    .and_then(|loc| loc.rsplit('/').next())
                    .map(|s| s.to_string())
                    .unwrap_or_default();

                Ok(CreateUserRes {
                    id,
                    username: req.username.clone(),
                    first_name: req.first_name.clone(),
                    last_name: req.last_name.clone(),
                    enabled: true,
                })
            }
            409 => Err(AppError::Conflict { resource: "user".into(), details: "Username already exists".into() }),
            401 => Err(AppError::InvalidToken),
            403 => Err(AppError::Forbidden),
            _ => {
                let body = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
                Err(AppError::ExternalServiceError{ details: body })
            }
        }
    }

    async fn get_users(&self, token: &str) -> Result<GetUsersRes, AppError> {
        let keycloak_url = format!(
            "{}://{}:{}/admin/realms/{}/users?enabled=true",
            env::var("KEYCLOAK_INTERNAL_PROTOCOL").unwrap(),
            env::var("KEYCLOAK_INTERNAL_HOST").unwrap(),
            env::var("KEYCLOAK_INTERNAL_API_PORT").unwrap(),
            env::var("KEYCLOAK_REALM").unwrap()
        );

        let client = Client::new();
        let response = client
            .get(&keycloak_url)
            .header("Authorization", token)
            .send()
            .await
            .map_err(|e| AppError::ExternalServiceError { details: e.to_string() })?;

        let status = response.status();
        if status.is_success() {
            let users_value = response.json::<Vec<Value>>().await
                .map_err(|e| AppError::ExternalServiceError { details: format!("Failed to parse Keycloak response: {}", e) })?;

            let users_vec: Vec<GetUserRes> = users_value.into_iter().map(|user_value| {
                let id = user_value.get("id").and_then(|v| v.as_str()).unwrap_or("").to_string();
                let username = user_value
                    .get("username")
                    .and_then(|v| v.as_str())
                    .or_else(|| user_value.get("email").and_then(|v| v.as_str()))
                    .unwrap_or("")
                    .to_string();
                let first_name = user_value
                    .get("firstName")
                    .or_else(|| user_value.get("first-name"))
                    .or_else(|| user_value.get("first_name"))
                    .and_then(|v| v.as_str())
                    .unwrap_or("")
                    .to_string();
                let last_name = user_value
                    .get("lastName")
                    .or_else(|| user_value.get("last-name"))
                    .or_else(|| user_value.get("last_name"))
                    .and_then(|v| v.as_str())
                    .unwrap_or("")
                    .to_string();
                let enabled = user_value.get("enabled").and_then(|v| v.as_bool()).unwrap_or(false);

                GetUserRes {
                    id,
                    username,
                    first_name,
                    last_name,
                    enabled,
                }
            }).collect();

            Ok(GetUsersRes { users: users_vec })
        } else {
            let body = response.text().await.unwrap_or_else(|_| "Could not read error body".to_string());
            match status.as_u16() {
                401 => Err(AppError::InvalidToken),
                403 => Err(AppError::Forbidden),
                _ => Err(AppError::ExternalServiceError { details: body }),
            }
        }
    }

    async fn get_user(&self, id: &str, token: &str) -> Result<GetUserRes, AppError> {
        let keycloak_url = format!(
            "{}://{}:{}/admin/realms/{}/users/{}",
            env::var("KEYCLOAK_INTERNAL_PROTOCOL").unwrap(),
            env::var("KEYCLOAK_INTERNAL_HOST").unwrap(),
            env::var("KEYCLOAK_INTERNAL_API_PORT").unwrap(),
            env::var("KEYCLOAK_REALM").unwrap(),
            id
        );

        let client = Client::new();
        let response = client
            .get(&keycloak_url)
            .header("Authorization", token)
            .send()
            .await
            .map_err(|e| AppError::ExternalServiceError { details: e.to_string() })?;

        let status = response.status();

        if status.is_success() {
            let user_value = response.json::<Value>().await
                .map_err(|e| AppError::ExternalServiceError { details: format!("Failed to parse Keycloak response: {}", e) })?;

            let id = user_value.get("id").and_then(|v| v.as_str()).unwrap_or("").to_string();
            let username = user_value
                .get("username")
                .and_then(|v| v.as_str())
                .or_else(|| user_value.get("email").and_then(|v| v.as_str()))
                .unwrap_or("")
                .to_string();
            let first_name = user_value
                .get("firstName")
                .or_else(|| user_value.get("first-name"))
                .or_else(|| user_value.get("first_name"))
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_string();
            let last_name = user_value
                .get("lastName")
                .or_else(|| user_value.get("last-name"))
                .or_else(|| user_value.get("last_name"))
                .and_then(|v| v.as_str())
                .unwrap_or("")
                .to_string();
            let enabled = user_value.get("enabled").and_then(|v| v.as_bool()).unwrap_or(false);

            Ok(GetUserRes {
                id,
                username,
                first_name,
                last_name,
                enabled,
            })
        } else {
            let body = response.text().await.unwrap_or_else(|_| "Could not read error body".to_string());
            match status.as_u16() {
                404 => Err(AppError::NotFound { resource: "user".into(), id: id.into() }),
                401 => Err(AppError::InvalidToken),
                403 => Err(AppError::Forbidden),
                _ => Err(AppError::ExternalServiceError { details: body }),
            }
        }
    }

    async fn update_user(&self, id: &str, req: &UpdateUserReq, token: &str) -> Result<CreateUserRes, AppError> {
        let keycloak_url = format!(
            "{}://{}:{}/admin/realms/{}/users/{}",
            env::var("KEYCLOAK_INTERNAL_PROTOCOL").unwrap(),
            env::var("KEYCLOAK_INTERNAL_HOST").unwrap(),
            env::var("KEYCLOAK_INTERNAL_API_PORT").unwrap(),
            env::var("KEYCLOAK_REALM").unwrap(),
            id
        );

        let client = Client::new();

        // 1. Get current user state
        let response = client
            .get(&keycloak_url)
            .header("Authorization", token)
            .send()
            .await
            .map_err(|e| AppError::ExternalServiceError { details: e.to_string() })?;

        if response.status().as_u16() == 404 {
            return Err(AppError::NotFound { resource: "user".into(), id: id.into() });
        }
        if !response.status().is_success() {
            let body = response.text().await.unwrap_or_default();
            return Err(AppError::ExternalServiceError { details: body });
        }

        let mut user_json: Value = response.json().await
            .map_err(|e| AppError::ExternalServiceError { details: format!("Failed to parse user data: {}", e) })?;

        // 2. Apply partial updates
        if let Some(username) = &req.username {
            user_json["username"] = json!(username);
            user_json["email"] = json!(username);
        }
        if let Some(first_name) = &req.first_name {
            user_json["firstName"] = json!(first_name);
        }
        if let Some(last_name) = &req.last_name {
            user_json["lastName"] = json!(last_name);
        }

        // 3. Send updated user object
        let response = client
            .put(&keycloak_url)
            .header("Authorization", token)
            .json(&user_json)
            .send()
            .await
            .map_err(|e| AppError::ExternalServiceError { details: e.to_string() })?;

        let status = response.status();
        match status.as_u16() {
            200 | 204 => Ok(CreateUserRes {
                id: id.to_string(),
                username: user_json["username"].as_str().unwrap_or_default().to_string(),
                first_name: user_json["firstName"].as_str().unwrap_or_default().to_string(),
                last_name: user_json["lastName"].as_str().unwrap_or_default().to_string(),
                enabled: user_json["enabled"].as_bool().unwrap_or(true),
            }),
            404 => Err(AppError::NotFound { resource: "user".into(), id: id.into() }),
            409 => Err(AppError::Conflict { resource: "user".into(), details: "Username already exists".into() }),
            401 => Err(AppError::InvalidToken),
            403 => Err(AppError::Forbidden),
            _ => {
                let body = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
                Err(AppError::ExternalServiceError { details: body })
            }
        }
    }

    async fn update_password(&self, id: &str, password: &str, token: &str) -> Result<(), AppError> {
        let keycloak_url = format!(
            "{}://{}:{}/admin/realms/{}/users/{}/reset-password",
            env::var("KEYCLOAK_INTERNAL_PROTOCOL").unwrap(),
            env::var("KEYCLOAK_INTERNAL_HOST").unwrap(),
            env::var("KEYCLOAK_INTERNAL_API_PORT").unwrap(),
            env::var("KEYCLOAK_REALM").unwrap(),
            id
        );

        let cred = json!({
            "type": "password",
            "value": password,
            "temporary": false
        });

        let client = Client::new();
        let response = client
            .put(&keycloak_url)
            .header("Authorization", token)
            .json(&cred)
            .send()
            .await
            .map_err(|e| AppError::ExternalServiceError { details: e.to_string() })?;

        let status = response.status();
        if status.is_success() {
            Ok(())
        } else {
            let body = response.text().await.unwrap_or_else(|_| "Could not read error body".to_string());
            match status.as_u16() {
                404 => Err(AppError::NotFound { resource: "user".into(), id: id.into() }),
                401 => Err(AppError::InvalidToken),
                403 => Err(AppError::Forbidden),
                _ => Err(AppError::ExternalServiceError { details: body }),
            }
        }
    }

    async fn delete_user(&self, id: &str, token: &str) -> Result<(), AppError> {
        let keycloak_url = format!(
            "{}://{}:{}/admin/realms/{}/users/{}",
            env::var("KEYCLOAK_INTERNAL_PROTOCOL").unwrap(),
            env::var("KEYCLOAK_INTERNAL_HOST").unwrap(),
            env::var("KEYCLOAK_INTERNAL_API_PORT").unwrap(),
            env::var("KEYCLOAK_REALM").unwrap(),
            id
        );

        // Logical delete: disable user
        let body = json!({ "enabled": false });
        let client = Client::new();
        let response = client
            .put(&keycloak_url)
            .header("Authorization", token)
            .json(&body)
            .send()
            .await
            .map_err(|e| AppError::ExternalServiceError { details: e.to_string() })?;

        let status = response.status();
        if status.is_success() {
            Ok(())
        } else {
            let body = response.text().await.unwrap_or_else(|_| "Could not read error body".to_string());
            match status.as_u16() {
                404 => Err(AppError::NotFound { resource: "user".into(), id: id.into() }),
                401 => Err(AppError::InvalidToken),
                403 => Err(AppError::Forbidden),
                _ => Err(AppError::ExternalServiceError { details: body }),
            }
        }
    }
}

#[async_trait::async_trait]
impl RoleProvider for KeycloakRoleAdapter {
    async fn create_role(&self, req: &CreateRoleReq, token: &str) -> Result<GetRoleRes, AppError> {
        let keycloak_url = format!(
            "{}://{}:{}/admin/realms/{}/roles",
            env::var("KEYCLOAK_INTERNAL_PROTOCOL").unwrap(),
            env::var("KEYCLOAK_INTERNAL_HOST").unwrap(),
            env::var("KEYCLOAK_INTERNAL_API_PORT").unwrap(),
            env::var("KEYCLOAK_REALM").unwrap()
        );

        let role_body = json!({
            "name": req.name,
            "composite": req.composite,
            "clientRole": req.client_role,
            "containerId": req.container_id
        });

        let client = Client::new();
        let response = client
            .post(&keycloak_url)
            .header("Authorization", token)
            .json(&role_body)
            .send()
            .await
            .map_err(|e| AppError::ExternalServiceError { details: e.to_string() })?;

        let status = response.status();
        match status.as_u16() {
            201 => {
                // Buscar o role recém-criado pelo nome
                let get_url = format!("{}/{}", keycloak_url, req.name);
                let get_response = client
                    .get(&get_url)
                    .header("Authorization", token)
                    .send()
                    .await
                    .map_err(|e| AppError::ExternalServiceError { details: e.to_string() })?;

                if get_response.status().is_success() {
                    let value = get_response.json::<serde_json::Value>().await
                        .map_err(|e| AppError::ExternalServiceError { details: format!("Failed to parse Keycloak response: {}", e) })?;

                    let id = value.get("id").and_then(|v| v.as_str()).unwrap_or("").to_string();
                    let name = value.get("name").and_then(|v| v.as_str()).unwrap_or("").to_string();
                    let description = value.get("description").and_then(|v| v.as_str()).unwrap_or("").to_string();

                    Ok(GetRoleRes { id, name, description })
                } else {
                    Err(AppError::ExternalServiceError { details: "Role created but could not fetch details".into() })
                }
            }
            409 => Err(AppError::Conflict { resource: "role".into(), details: "Role already exists".into() }),
            401 => Err(AppError::InvalidToken),
            403 => Err(AppError::Forbidden),
            _ => {
                let body = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
                Err(AppError::ExternalServiceError { details: body })
            }
        }
    }

    async fn get_roles(&self, token: &str) -> Result<GetAllRolesRes, AppError> {
        let keycloak_url = format!(
            "{}://{}:{}/admin/realms/{}/roles?briefRepresentation=false",
            env::var("KEYCLOAK_INTERNAL_PROTOCOL").unwrap(),
            env::var("KEYCLOAK_INTERNAL_HOST").unwrap(),
            env::var("KEYCLOAK_INTERNAL_API_PORT").unwrap(),
            env::var("KEYCLOAK_REALM").unwrap()
        );

        let client = Client::new();
        let response = client
            .get(&keycloak_url)
            .header("Authorization", token)
            .send()
            .await
            .map_err(|e| AppError::ExternalServiceError { details: e.to_string() })?;

        let status = response.status();
        if status.is_success() {
            let roles_value = response.json::<Vec<serde_json::Value>>().await
                .map_err(|e| AppError::ExternalServiceError { details: format!("Failed to parse Keycloak response: {}", e) })?;

            let roles_vec: Vec<GetRoleRes> = roles_value.into_iter()
        .filter(|rv| {
            // Mantém apenas não deletados
            let deleted = rv.get("attributes")
                .and_then(|a| a.get("deleted"))
                .and_then(|v| v.as_array())
                .map(|arr| arr.iter().any(|x| x.as_str() == Some("true")))
                .unwrap_or(false);
            !deleted
        })
        .map(|role_value| {
            let id = role_value.get("id").and_then(|v| v.as_str()).unwrap_or("").to_string();
            let name = role_value.get("name").and_then(|v| v.as_str()).unwrap_or("").to_string();
            let description = role_value.get("description").and_then(|v| v.as_str()).unwrap_or("").to_string();
            GetRoleRes { id, name, description }
        })
        .collect();
            Ok(GetAllRolesRes { roles: roles_vec })
        } else {
            let body = response.text().await.unwrap_or_else(|_| "Could not read error body".to_string());
            match status.as_u16() {
                401 => Err(AppError::InvalidToken),
                403 => Err(AppError::Forbidden),
                _ => Err(AppError::ExternalServiceError { details: body }),
            }
        }
    }

    async fn get_role(&self, id: &str, token: &str) -> Result<GetRoleRes, AppError> {
        let keycloak_url = format!(
            "{}://{}:{}/admin/realms/{}/roles-by-id/{}",
            env::var("KEYCLOAK_INTERNAL_PROTOCOL").unwrap(),
            env::var("KEYCLOAK_INTERNAL_HOST").unwrap(),
            env::var("KEYCLOAK_INTERNAL_API_PORT").unwrap(),
            env::var("KEYCLOAK_REALM").unwrap(),
            id
        );

        let client = Client::new();
        let response = client
            .get(&keycloak_url)
            .header("Authorization", token)
            .send()
            .await
            .map_err(|e| AppError::ExternalServiceError { details: e.to_string() })?;

        let status = response.status();

        if status.is_success() {
            let value = response.json::<serde_json::Value>().await
                .map_err(|e| AppError::ExternalServiceError { details: format!("Failed to parse Keycloak response: {}", e) })?;

            // Checagem inline de soft delete
            let deleted = value
                .get("attributes")
                .and_then(|a| a.get("deleted"))
                .map(|del| match del {
                    serde_json::Value::Array(arr) => arr.iter().any(|x| {
                        x.as_str()
                            .map(|s| s.eq_ignore_ascii_case("true") || s == "1")
                            .unwrap_or(false)
                    }),
                    serde_json::Value::String(s) => s.eq_ignore_ascii_case("true") || s == "1",
                    serde_json::Value::Bool(b) => *b,
                    _ => false,
                })
                .unwrap_or(false);

            if deleted {
                return Err(AppError::NotFound { resource: "role".into(), id: id.into() });
            }

            let id = value.get("id").and_then(|v| v.as_str()).unwrap_or("").to_string();
            let name = value.get("name").and_then(|v| v.as_str()).unwrap_or("").to_string();
            let description = value.get("description").and_then(|v| v.as_str()).unwrap_or("").to_string();

            Ok(GetRoleRes { id, name, description })
        } else {
            let body = response.text().await.unwrap_or_else(|_| "Could not read error body".to_string());
            match status.as_u16() {
                404 => Err(AppError::NotFound { resource: "role".into(), id: id.into() }),
                401 => Err(AppError::InvalidToken),
                403 => Err(AppError::Forbidden),
                _ => Err(AppError::ExternalServiceError { details: body }),
            }
        }
    }

    async fn update_role(&self, id: &str, req: &CreateRoleReq, token: &str) -> Result<(), AppError> {
        let keycloak_url = format!(
            "{}://{}:{}/admin/realms/{}/roles-by-id/{}",
            env::var("KEYCLOAK_INTERNAL_PROTOCOL").unwrap(),
            env::var("KEYCLOAK_INTERNAL_HOST").unwrap(),
            env::var("KEYCLOAK_INTERNAL_API_PORT").unwrap(),
            env::var("KEYCLOAK_REALM").unwrap(),
            id
        );

        let client = Client::new();

        // GET para garantir existência e inspecionar atributos
        let get_resp = client
            .get(&keycloak_url)
            .header("Authorization", token)
            .send()
            .await
            .map_err(|e| AppError::ExternalServiceError { details: e.to_string() })?;

        match get_resp.status().as_u16() {
            404 => return Err(AppError::NotFound { resource: "role".into(), id: id.into() }),
            401 => return Err(AppError::InvalidToken),
            403 => return Err(AppError::Forbidden),
            s if s >= 400 => {
                let body = get_resp.text().await.unwrap_or_default();
                return Err(AppError::ExternalServiceError { details: body });
            }
            _ => {}
        }

        let current_role = get_resp
            .json::<Value>()
            .await
            .map_err(|e| AppError::ExternalServiceError { details: format!("Failed to parse role: {}", e) })?;

        // Verifica atributo "disabled" (soft flag). Se presente e true, bloqueia update.
        let is_disabled = current_role
            .get("attributes")
            .and_then(|a| a.get("deleted"))
            .map(|v| match v {
                Value::Array(arr) => arr.iter().any(|x| {
                    x.as_str()
                        .map(|s| s.eq_ignore_ascii_case("true") || s == "1")
                        .unwrap_or(false)
                }),
                Value::String(s) => s.eq_ignore_ascii_case("true") || s == "1",
                Value::Bool(b) => *b,
                _ => false,
            })
            .unwrap_or(false);

        if is_disabled {
            return Err(AppError::ValidationError { details: "Role is disabled".into() });
        }

        // Preserva campos não enviados no DTO
        let description = current_role
            .get("description")
            .and_then(|v| v.as_str())
            .unwrap_or("");

        let attributes = current_role
            .get("attributes")
            .cloned()
            .unwrap_or_else(|| json!({}));

        let role_body = json!({
            "id": id,
            "name": req.name,
            "description": description,
            "composite": req.composite,
            "clientRole": req.client_role,
            "containerId": req.container_id,
            "attributes": attributes
        });

        let response = client
            .put(&keycloak_url)
            .header("Authorization", token)
            .json(&role_body)
            .send()
            .await
            .map_err(|e| AppError::ExternalServiceError { details: e.to_string() })?;

        let status = response.status();
        match status.as_u16() {
            200 | 204 => Ok(()),
            404 => Err(AppError::NotFound { resource: "role".into(), id: id.into() }),
            401 => Err(AppError::InvalidToken),
            403 => Err(AppError::Forbidden),
            409 => Err(AppError::Conflict { resource: "role".into(), details: "Conflict updating role".into() }),
            _ => {
                let body = response.text().await.unwrap_or_else(|_| "Could not read error body".to_string());
                Err(AppError::ExternalServiceError { details: body })
            }
        }
    }

    async fn delete_role(&self, id: &str, token: &str) -> Result<(), AppError> {
        // 1. Buscar role atual
        let get_url = format!(
            "{}://{}:{}/admin/realms/{}/roles-by-id/{}",
            env::var("KEYCLOAK_INTERNAL_PROTOCOL").unwrap(),
            env::var("KEYCLOAK_INTERNAL_HOST").unwrap(),
            env::var("KEYCLOAK_INTERNAL_API_PORT").unwrap(),
            env::var("KEYCLOAK_REALM").unwrap(),
            id
        );
        let client = Client::new();
        let get_resp = client
            .get(&get_url)
            .header("Authorization", token)
            .send()
            .await
            .map_err(|e| AppError::ExternalServiceError { details: e.to_string() })?;

        if get_resp.status().as_u16() == 404 {
            return Err(AppError::NotFound { resource: "role".into(), id: id.into() });
        }
        if !get_resp.status().is_success() {
            let body = get_resp.text().await.unwrap_or_default();
            return Err(AppError::ExternalServiceError { details: body });
        }

        let mut role_json = get_resp
            .json::<Value>()
            .await
            .map_err(|e| AppError::ExternalServiceError { details: format!("Failed to parse role: {}", e) })?;

        // 2. Marcar exclusão lógica (atributo customizado)
        {
            let attrs = role_json
                .as_object_mut()
                .unwrap()
                .entry("attributes")
                .or_insert_with(|| json!({}));
            if attrs.is_object() {
                attrs.as_object_mut().unwrap().insert("deleted".to_string(), json!(["true"]));
            }
        }

        // 3. PUT roles-by-id/{id} com atributos atualizados
        let put_resp = client
            .put(&get_url)
            .header("Authorization", token)
            .json(&role_json)
            .send()
            .await
            .map_err(|e| AppError::ExternalServiceError { details: e.to_string() })?;

        let status = put_resp.status();
        match status.as_u16() {
            200 | 204 => Ok(()),
            404 => Err(AppError::NotFound { resource: "role".into(), id: id.into() }),
            401 => Err(AppError::InvalidToken),
            403 => Err(AppError::Forbidden),
            _ => {
                let body = put_resp.text().await.unwrap_or_else(|_| "Unknown error".to_string());
                Err(AppError::ExternalServiceError { details: body })
            }
        }
    }
}