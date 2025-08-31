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
use crate::core::dtos::req::update_role_partial_req::UpdateRolePartialReq;
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
            .map_err(|e| AppError::ExternalServiceError {
                code: e.status().map_or(500, |s| s.as_u16()),
                details: e.to_string(),
                source: Some(e),
            })?;

        let status = response.status();
        if status.is_success() {
            response
                .json::<LoginResKeycloak>()
                .await
                .map_err(|e| AppError::ExternalServiceError {
                    code: e.status().map_or(500, |s| s.as_u16()),
                    details: format!("Failed to parse Keycloak response: {}", e),
                    source: Some(e),
                })
        } else {
            let code = status.as_u16();
            let error_body = response
                .text()
                .await
                .unwrap_or_else(|_| "Could not read error body".to_string());
            match code {
                400 => Err(AppError::ValidationError { details: error_body }),
                401 => Err(AppError::InvalidCredentials { code }),
                _ => Err(AppError::ExternalServiceError {
                    code,
                    details: error_body,
                    source: None,
                }),
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
            .map_err(|e| AppError::ExternalServiceError {
                code: e.status().map_or(500, |s| s.as_u16()),
                details: e.to_string(),
                source: Some(e),
            })?;

        let status = response.status();
        let code = status.as_u16();
        match code {
            201 => {
                let id = response
                    .headers()
                    .get("location")
                    .and_then(|loc| loc.to_str().ok())
                    .and_then(|loc| loc.split('/').last())
                    .unwrap_or_default();

                Ok(CreateUserRes {
                    id: id.to_string(),
                    username: req.username.clone(),
                    first_name: req.first_name.clone(),
                    last_name: req.last_name.clone(),
                    enabled: true,
                })
            }
            409 => Err(AppError::Conflict {
                code,
                resource: "user".into(),
                details: "Username already exists".into(),
            }),
            401 => Err(AppError::InvalidToken { code }),
            403 => Err(AppError::Forbidden { code }),
            _ => {
                let body = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
                Err(AppError::ExternalServiceError {
                    code,
                    details: body,
                    source: None,
                })
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
            .map_err(|e| AppError::ExternalServiceError {
                code: e.status().map_or(500, |s| s.as_u16()),
                details: e.to_string(),
                source: Some(e),
            })?;

        let status = response.status();
        if status.is_success() {
            let users_value = response
                .json::<Vec<Value>>()
                .await
                .map_err(|e| AppError::ExternalServiceError {
                    code: e.status().map_or(500, |s| s.as_u16()),
                    details: format!("Failed to parse Keycloak response: {}", e),
                    source: Some(e),
                })?;

            let users_vec: Vec<GetUserRes> = users_value
                .into_iter()
                .map(|user_value| {
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
                })
                .collect();

            Ok(GetUsersRes { users: users_vec })
        } else {
            let code = status.as_u16();
            let body = response
                .text()
                .await
                .unwrap_or_else(|_| "Could not read error body".to_string());
            match code {
                401 => Err(AppError::InvalidToken { code }),
                403 => Err(AppError::Forbidden { code }),
                _ => Err(AppError::ExternalServiceError {
                    code,
                    details: body,
                    source: None,
                }),
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
            .map_err(|e| AppError::ExternalServiceError {
                code: e.status().map_or(500, |s| s.as_u16()),
                details: e.to_string(),
                source: Some(e),
            })?;

        let status = response.status();

        if status.is_success() {
            let user_value = response
                .json::<Value>()
                .await
                .map_err(|e| AppError::ExternalServiceError {
                    code: e.status().map_or(500, |s| s.as_u16()),
                    details: format!("Failed to parse Keycloak response: {}", e),
                    source: Some(e),
                })?;

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
            let code = status.as_u16();
            let body = response
                .text()
                .await
                .unwrap_or_else(|_| "Could not read error body".to_string());
            match code {
                404 => Err(AppError::NotFound {
                    code,
                    resource: "user".into(),
                    id: id.into(),
                }),
                401 => Err(AppError::InvalidToken { code }),
                403 => Err(AppError::Forbidden { code }),
                _ => Err(AppError::ExternalServiceError {
                    code,
                    details: body,
                    source: None,
                }),
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
            .map_err(|e| AppError::ExternalServiceError {
                code: e.status().map_or(500, |s| s.as_u16()),
                details: e.to_string(),
                source: Some(e),
            })?;

        let status = response.status();
        if status.as_u16() == 404 {
            return Err(AppError::NotFound {
                code: 404,
                resource: "user".into(),
                id: id.into(),
            });
        }
        if !status.is_success() {
            let code = status.as_u16();
            let body = response.text().await.unwrap_or_default();
            return Err(AppError::ExternalServiceError {
                code,
                details: body,
                source: None,
            });
        }

        let mut user_json: Value =
            response.json().await.map_err(|e| AppError::ExternalServiceError {
                code: e.status().map_or(500, |s| s.as_u16()),
                details: format!("Failed to parse user data: {}", e),
                source: Some(e),
            })?;

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
            .map_err(|e| AppError::ExternalServiceError {
                code: e.status().map_or(500, |s| s.as_u16()),
                details: e.to_string(),
                source: Some(e),
            })?;

        let status = response.status();
        let code = status.as_u16();
        match code {
            200 | 204 => Ok(CreateUserRes {
                id: id.to_string(),
                username: user_json["username"].as_str().unwrap_or_default().to_string(),
                first_name: user_json["firstName"].as_str().unwrap_or_default().to_string(),
                last_name: user_json["lastName"].as_str().unwrap_or_default().to_string(),
                enabled: user_json["enabled"].as_bool().unwrap_or(true),
            }),
            404 => Err(AppError::NotFound {
                code,
                resource: "user".into(),
                id: id.into(),
            }),
            409 => Err(AppError::Conflict {
                code,
                resource: "user".into(),
                details: "Username already exists".into(),
            }),
            401 => Err(AppError::InvalidToken { code }),
            403 => Err(AppError::Forbidden { code }),
            _ => {
                let body = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
                Err(AppError::ExternalServiceError {
                    code,
                    details: body,
                    source: None,
                })
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
            .map_err(|e| AppError::ExternalServiceError {
                code: e.status().map_or(500, |s| s.as_u16()),
                details: e.to_string(),
                source: Some(e),
            })?;

        let status = response.status();
        if status.is_success() {
            Ok(())
        } else {
            let code = status.as_u16();
            let body = response
                .text()
                .await
                .unwrap_or_else(|_| "Could not read error body".to_string());
            match code {
                404 => Err(AppError::NotFound {
                    code,
                    resource: "user".into(),
                    id: id.into(),
                }),
                401 => Err(AppError::InvalidToken { code }),
                403 => Err(AppError::Forbidden { code }),
                _ => Err(AppError::ExternalServiceError {
                    code,
                    details: body,
                    source: None,
                }),
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
            .map_err(|e| AppError::ExternalServiceError {
                code: e.status().map_or(500, |s| s.as_u16()),
                details: e.to_string(),
                source: Some(e),
            })?;

        let status = response.status();
        if status.is_success() {
            Ok(())
        } else {
            let code = status.as_u16();
            let body = response
                .text()
                .await
                .unwrap_or_else(|_| "Could not read error body".to_string());
            match code {
                404 => Err(AppError::NotFound {
                    code,
                    resource: "user".into(),
                    id: id.into(),
                }),
                401 => Err(AppError::InvalidToken { code }),
                403 => Err(AppError::Forbidden { code }),
                _ => Err(AppError::ExternalServiceError {
                    code,
                    details: body,
                    source: None,
                }),
            }
        }
    }

    async fn add_role(&self, user_id: &str, role_id: &str, token: &str) -> Result<(), AppError> {
        // Buscar role (precisa do name para mapping)
        let role_url = format!(
            "{}://{}:{}/admin/realms/{}/roles-by-id/{}",
            env::var("KEYCLOAK_INTERNAL_PROTOCOL").unwrap(),
            env::var("KEYCLOAK_INTERNAL_HOST").unwrap(),
            env::var("KEYCLOAK_INTERNAL_API_PORT").unwrap(),
            env::var("KEYCLOAK_REALM").unwrap(),
            role_id
        );
        let client = Client::new();
        let role_resp = client
            .get(&role_url)
            .header("Authorization", token)
            .send()
            .await
            .map_err(|e| AppError::ExternalServiceError {
                code: e.status().map_or(500, |s| s.as_u16()),
                details: e.to_string(),
                source: Some(e),
            })?;

        let status = role_resp.status();
        match status.as_u16() {
            404 => {
                return Err(AppError::NotFound {
                    code: 404,
                    resource: "role".into(),
                    id: role_id.into(),
                })
            }
            401 => return Err(AppError::InvalidToken { code: 401 }),
            403 => return Err(AppError::Forbidden { code: 403 }),
            s if s >= 400 => {
                let body = role_resp.text().await.unwrap_or_default();
                return Err(AppError::ExternalServiceError {
                    code: s,
                    details: body,
                    source: None,
                });
            }
            _ => {}
        }

        let role_json =
            role_resp.json::<Value>().await.map_err(|e| AppError::ExternalServiceError {
                code: e.status().map_or(500, |s| s.as_u16()),
                details: format!("Failed to parse role: {}", e),
                source: Some(e),
            })?;

        // Bloqueia se deleted
        let deleted = role_json
            .get("attributes")
            .and_then(|a| a.get("deleted"))
            .and_then(|v| v.as_array())
            .map(|arr| {
                arr.iter()
                    .any(|x| x.as_str().map(|s| s.eq_ignore_ascii_case("true") || s == "1").unwrap_or(false))
            })
            .unwrap_or(false);
        if deleted {
            return Err(AppError::ValidationError {
                details: "Role is deleted".into(),
            });
        }

        let mapping_url = format!(
            "{}://{}:{}/admin/realms/{}/users/{}/role-mappings/realm",
            env::var("KEYCLOAK_INTERNAL_PROTOCOL").unwrap(),
            env::var("KEYCLOAK_INTERNAL_HOST").unwrap(),
            env::var("KEYCLOAK_INTERNAL_API_PORT").unwrap(),
            env::var("KEYCLOAK_REALM").unwrap(),
            user_id
        );

        // Representação mínima
        let role_repr = json!([{
            "id": role_json.get("id").and_then(|v| v.as_str()).unwrap_or(role_id),
            "name": role_json.get("name").and_then(|v| v.as_str()).unwrap_or(""),
        }]);

        let resp = client
            .post(&mapping_url)
            .header("Authorization", token)
            .json(&role_repr)
            .send()
            .await
            .map_err(|e| AppError::ExternalServiceError {
                code: e.status().map_or(500, |s| s.as_u16()),
                details: e.to_string(),
                source: Some(e),
            })?;

        let status = resp.status();
        match status.as_u16() {
            204 => Ok(()),
            404 => Err(AppError::NotFound {
                code: 404,
                resource: "user".into(),
                id: user_id.into(),
            }),
            401 => Err(AppError::InvalidToken { code: 401 }),
            403 => Err(AppError::Forbidden { code: 403 }),
            _ => {
                let body = resp.text().await.unwrap_or_else(|_| "Unknown error".to_string());
                Err(AppError::ExternalServiceError {
                    code: status.as_u16(),
                    details: body,
                    source: None,
                })
            }
        }
    }

    async fn remove_role(&self, user_id: &str, role_id: &str, token: &str) -> Result<(), AppError> {
        // Buscar role (precisa do name para mapping)
        let role_url = format!(
            "{}://{}:{}/admin/realms/{}/roles-by-id/{}",
            env::var("KEYCLOAK_INTERNAL_PROTOCOL").unwrap(),
            env::var("KEYCLOAK_INTERNAL_HOST").unwrap(),
            env::var("KEYCLOAK_INTERNAL_API_PORT").unwrap(),
            env::var("KEYCLOAK_REALM").unwrap(),
            role_id
        );
        let client = Client::new();
        let role_resp = client
            .get(&role_url)
            .header("Authorization", token)
            .send()
            .await
            .map_err(|e| AppError::ExternalServiceError {
                code: e.status().map_or(500, |s| s.as_u16()),
                details: e.to_string(),
                source: Some(e),
            })?;

        let status = role_resp.status();
        match status.as_u16() {
            404 => {
                return Err(AppError::NotFound {
                    code: 404,
                    resource: "role".into(),
                    id: role_id.into(),
                })
            }
            401 => return Err(AppError::InvalidToken { code: 401 }),
            403 => return Err(AppError::Forbidden { code: 403 }),
            s if s >= 400 => {
                let body = role_resp.text().await.unwrap_or_default();
                return Err(AppError::ExternalServiceError {
                    code: s,
                    details: body,
                    source: None,
                });
            }
            _ => {}
        }

        let role_json =
            role_resp.json::<Value>().await.map_err(|e| AppError::ExternalServiceError {
                code: e.status().map_or(500, |s| s.as_u16()),
                details: format!("Failed to parse role: {}", e),
                source: Some(e),
            })?;

        let mapping_url = format!(
            "{}://{}:{}/admin/realms/{}/users/{}/role-mappings/realm",
            env::var("KEYCLOAK_INTERNAL_PROTOCOL").unwrap(),
            env::var("KEYCLOAK_INTERNAL_HOST").unwrap(),
            env::var("KEYCLOAK_INTERNAL_API_PORT").unwrap(),
            env::var("KEYCLOAK_REALM").unwrap(),
            user_id
        );

        // Representação mínima
        let role_repr = json!([{
            "id": role_json.get("id").and_then(|v| v.as_str()).unwrap_or(role_id),
            "name": role_json.get("name").and_then(|v| v.as_str()).unwrap_or(""),
        }]);

        let resp = client
            .delete(&mapping_url)
            .header("Authorization", token)
            .json(&role_repr)
            .send()
            .await
            .map_err(|e| AppError::ExternalServiceError {
                code: e.status().map_or(500, |s| s.as_u16()),
                details: e.to_string(),
                source: Some(e),
            })?;

        let status = resp.status();
        match status.as_u16() {
            204 => Ok(()),
            404 => Err(AppError::NotFound {
                code: 404,
                resource: "user".into(),
                id: user_id.into(),
            }),
            401 => Err(AppError::InvalidToken { code: 401 }),
            403 => Err(AppError::Forbidden { code: 403 }),
            _ => {
                let body = resp.text().await.unwrap_or_else(|_| "Unknown error".to_string());
                Err(AppError::ExternalServiceError {
                    code: status.as_u16(),
                    details: body,
                    source: None,
                })
            }
        }
    }
}

#[async_trait::async_trait]
impl RoleProvider for KeycloakRoleAdapter {
    async fn create_role(&self, req: &CreateRoleReq, token: &str) -> Result<GetRoleRes, AppError> {
        let url = format!(
            "{}://{}:{}/admin/realms/{}/roles",
            env::var("KEYCLOAK_INTERNAL_PROTOCOL").unwrap(),
            env::var("KEYCLOAK_INTERNAL_HOST").unwrap(),
            env::var("KEYCLOAK_INTERNAL_API_PORT").unwrap(),
            env::var("KEYCLOAK_REALM").unwrap()
        );

        let client = Client::new();
        let resp = client
            .post(&url)
            .header("Authorization", token)
            .json(req)
            .send()
            .await
            .map_err(|e| AppError::ExternalServiceError {
                code: e.status().map_or(500, |s| s.as_u16()),
                details: e.to_string(),
                source: Some(e),
            })?;

        let status = resp.status();
        match status.as_u16() {
            201 => {
                let location = resp
                    .headers()
                    .get("location")
                    .and_then(|h| h.to_str().ok())
                    .unwrap_or("");
                let id = location.split('/').last().unwrap_or("").to_string();
                // After creating, fetch the role to return the full GetRoleRes
                self.get_role(&id, token).await
            }
            401 => Err(AppError::InvalidToken { code: 401 }),
            403 => Err(AppError::Forbidden { code: 403 }),
            409 => Err(AppError::Conflict {
                code: 409,
                resource: "role".into(),
                details: format!("Role with name '{}' already exists", req.name),
            }),
            _ => {
                let body = resp.text().await.unwrap_or_else(|_| "Unknown error".to_string());
                Err(AppError::ExternalServiceError {
                    code: status.as_u16(),
                    details: body,
                    source: None,
                })
            }
        }
    }

    async fn get_roles(&self, token: &str) -> Result<GetAllRolesRes, AppError> {
        let url = format!(
            "{}://{}:{}/admin/realms/{}/roles",
            env::var("KEYCLOAK_INTERNAL_PROTOCOL").unwrap(),
            env::var("KEYCLOAK_INTERNAL_HOST").unwrap(),
            env::var("KEYCLOAK_INTERNAL_API_PORT").unwrap(),
            env::var("KEYCLOAK_REALM").unwrap()
        );

        let client = Client::new();
        let resp = client
            .get(&url)
            .header("Authorization", token)
            .send()
            .await
            .map_err(|e| AppError::ExternalServiceError {
                code: e.status().map_or(500, |s| s.as_u16()),
                details: e.to_string(),
                source: Some(e),
            })?;

        let status = resp.status();
        match status.as_u16() {
            200 => {
                let roles_json = resp.json::<Vec<Value>>().await.map_err(|e| {
                    AppError::ExternalServiceError {
                        code: e.status().map_or(500, |s| s.as_u16()),
                        details: format!("Failed to parse roles list: {}", e),
                        source: Some(e),
                    }
                })?;

                let roles = roles_json
                    .into_iter()
                    .filter(|role| {
                        let deleted = role
                            .get("attributes")
                            .and_then(|a| a.get("deleted"))
                            .and_then(|v| v.as_array())
                            .map(|arr| {
                                arr.iter().any(
                                    |x| x.as_str().map(|s| s.eq_ignore_ascii_case("true") || s == "1").unwrap_or(false),
                                )
                            })
                            .unwrap_or(false);
                        !deleted
                    })
                    .map(|role| GetRoleRes {
                        id: role.get("id").and_then(|v| v.as_str()).unwrap_or("").to_string(),
                        name: role.get("name").and_then(|v| v.as_str()).unwrap_or("").to_string(),
                        description: role.get("description").and_then(|v| v.as_str()).unwrap_or("").to_string(),
                    })
                    .collect();

                Ok(GetAllRolesRes { roles })
            }
            401 => Err(AppError::InvalidToken { code: 401 }),
            403 => Err(AppError::Forbidden { code: 403 }),
            _ => {
                let body = resp.text().await.unwrap_or_else(|_| "Unknown error".to_string());
                Err(AppError::ExternalServiceError {
                    code: status.as_u16(),
                    details: body,
                    source: None,
                })
            }
        }
    }

    async fn get_role(&self, id: &str, token: &str) -> Result<GetRoleRes, AppError> {
        let url = format!(
            "{}://{}:{}/admin/realms/{}/roles-by-id/{}",
            env::var("KEYCLOAK_INTERNAL_PROTOCOL").unwrap(),
            env::var("KEYCLOAK_INTERNAL_HOST").unwrap(),
            env::var("KEYCLOAK_INTERNAL_API_PORT").unwrap(),
            env::var("KEYCLOAK_REALM").unwrap(),
            id
        );

        let client = Client::new();
        let resp = client
            .get(&url)
            .header("Authorization", token)
            .send()
            .await
            .map_err(|e| AppError::ExternalServiceError {
                code: e.status().map_or(500, |s| s.as_u16()),
                details: e.to_string(),
                source: Some(e),
            })?;

        let status = resp.status();
        match status.as_u16() {
            200 => {
                let role_json = resp.json::<Value>().await.map_err(|e| {
                    AppError::ExternalServiceError {
                        code: e.status().map_or(500, |s| s.as_u16()),
                        details: format!("Failed to parse role: {}", e),
                        source: Some(e),
                    }
                })?;

                let deleted = role_json
                    .get("attributes")
                    .and_then(|a| a.get("deleted"))
                    .and_then(|v| v.as_array())
                    .map(|arr| {
                        arr.iter().any(
                            |x| x.as_str().map(|s| s.eq_ignore_ascii_case("true") || s == "1").unwrap_or(false),
                        )
                    })
                    .unwrap_or(false);

                if deleted {
                    Err(AppError::NotFound {
                        code: 404,
                        resource: "role".into(),
                        id: id.into(),
                    })
                } else {
                    Ok(GetRoleRes {
                        id: role_json.get("id").and_then(|v| v.as_str()).unwrap_or("").to_string(),
                        name: role_json.get("name").and_then(|v| v.as_str()).unwrap_or("").to_string(),
                        description: role_json.get("description").and_then(|v| v.as_str()).unwrap_or("").to_string(),
                    })
                }
            }
            404 => Err(AppError::NotFound {
                code: 404,
                resource: "role".into(),
                id: id.into(),
            }),
            401 => Err(AppError::InvalidToken { code: 401 }),
            403 => Err(AppError::Forbidden { code: 403 }),
            _ => {
                let body = resp.text().await.unwrap_or_else(|_| "Unknown error".to_string());
                Err(AppError::ExternalServiceError {
                    code: status.as_u16(),
                    details: body,
                    source: None,
                })
            }
        }
    }

    async fn update_role(&self, id: &str, req: &CreateRoleReq, token: &str) -> Result<(), AppError> {
        let url = format!(
            "{}://{}:{}/admin/realms/{}/roles-by-id/{}",
            env::var("KEYCLOAK_INTERNAL_PROTOCOL").unwrap(),
            env::var("KEYCLOAK_INTERNAL_HOST").unwrap(),
            env::var("KEYCLOAK_INTERNAL_API_PORT").unwrap(),
            env::var("KEYCLOAK_REALM").unwrap(),
            id
        );

        let client = Client::new();
        let resp = client
            .put(&url)
            .header("Authorization", token)
            .json(req)
            .send()
            .await
            .map_err(|e| AppError::ExternalServiceError {
                code: e.status().map_or(500, |s| s.as_u16()),
                details: e.to_string(),
                source: Some(e),
            })?;

        let status = resp.status();
        match status.as_u16() {
            204 => Ok(()),
            404 => Err(AppError::NotFound {
                code: 404,
                resource: "role".into(),
                id: id.into(),
            }),
            401 => Err(AppError::InvalidToken { code: 401 }),
            403 => Err(AppError::Forbidden { code: 403 }),
            409 => Err(AppError::Conflict {
                code: 409,
                resource: "role".into(),
                details: format!("Role with name '{}' already exists", req.name),
            }),
            _ => {
                let body = resp.text().await.unwrap_or_else(|_| "Unknown error".to_string());
                Err(AppError::ExternalServiceError {
                    code: status.as_u16(),
                    details: body,
                    source: None,
                })
            }
        }
    }

    async fn patch_role(&self, id: &str, req: &UpdateRolePartialReq, token: &str) -> Result<GetRoleRes, AppError> {
        let url = format!(
            "{}://{}:{}/admin/realms/{}/roles-by-id/{}",
            env::var("KEYCLOAK_INTERNAL_PROTOCOL").unwrap(),
            env::var("KEYCLOAK_INTERNAL_HOST").unwrap(),
            env::var("KEYCLOAK_INTERNAL_API_PORT").unwrap(),
            env::var("KEYCLOAK_REALM").unwrap(),
            id
        );

        let client = Client::new();
        let resp = client
            .put(&url)
            .header("Authorization", token)
            .json(req)
            .send()
            .await
            .map_err(|e| AppError::ExternalServiceError {
                code: e.status().map_or(500, |s| s.as_u16()),
                details: e.to_string(),
                source: Some(e),
            })?;

        let status = resp.status();
        match status.as_u16() {
            204 => {
                // After patching, fetch the role to return the updated state
                self.get_role(id, token).await
            },
            404 => Err(AppError::NotFound {
                code: 404,
                resource: "role".into(),
                id: id.into(),
            }),
            401 => Err(AppError::InvalidToken { code: 401 }),
            403 => Err(AppError::Forbidden { code: 403 }),
            _ => {
                let body = resp.text().await.unwrap_or_else(|_| "Unknown error".to_string());
                Err(AppError::ExternalServiceError {
                    code: status.as_u16(),
                    details: body,
                    source: None,
                })
            }
        }
    }

    async fn delete_role(&self, id: &str, token: &str) -> Result<(), AppError> {
        let url = format!(
            "{}://{}:{}/admin/realms/{}/roles-by-id/{}",
            env::var("KEYCLOAK_INTERNAL_PROTOCOL").unwrap(),
            env::var("KEYCLOAK_INTERNAL_HOST").unwrap(),
            env::var("KEYCLOAK_INTERNAL_API_PORT").unwrap(),
            env::var("KEYCLOAK_REALM").unwrap(),
            id
        );

        let client = Client::new();
        let resp = client
            .delete(&url)
            .header("Authorization", token)
            .send()
            .await
            .map_err(|e| AppError::ExternalServiceError {
                code: e.status().map_or(500, |s| s.as_u16()),
                details: e.to_string(),
                source: Some(e),
            })?;

        let status = resp.status();
        match status.as_u16() {
            204 => Ok(()),
            404 => Err(AppError::NotFound {
                code: 404,
                resource: "role".into(),
                id: id.into(),
            }),
            401 => Err(AppError::InvalidToken { code: 401 }),
            403 => Err(AppError::Forbidden { code: 403 }),
            _ => {
                let body = resp.text().await.unwrap_or_else(|_| "Unknown error".to_string());
                Err(AppError::ExternalServiceError {
                    code: status.as_u16(),
                    details: body,
                    source: None,
                })
            }
        }
    }
}