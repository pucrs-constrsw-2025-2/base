use crate::core::dtos::req::login_req::LoginReqKeycloak;
use crate::core::dtos::res::login_res::LoginResKeycloak;
use crate::core::dtos::req::create_user_req::CreateUserReq;
use crate::core::dtos::res::create_user_res::CreateUserRes;
use crate::core::dtos::res::get_all_users_res::GetUsersRes;
use crate::core::dtos::res::get_user_res::GetUserRes;
use crate::core::dtos::res::get_all_roles_res::GetAllRolesRes;
use crate::core::dtos::res::get_role_res::GetRoleRes;
use crate::core::interfaces::role_provider::RoleProvider;
use crate::core::interfaces::auth_provider::AuthProvider;
use crate::core::interfaces::user_provider::UserProvider;
use serde_json::{ json, Value };
use reqwest::Client;
use std::env;

pub struct KeycloakAuthAdapter;
pub struct KeycloakUserAdapter;
pub struct KeycloakRoleAdapter;

#[async_trait::async_trait]
impl AuthProvider for KeycloakAuthAdapter {
    async fn login(&self, req: &LoginReqKeycloak) -> Result<LoginResKeycloak, actix_web::Error> {
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
            .map_err(|_| actix_web::error::ErrorInternalServerError("Failed to connect to Keycloak"))?;

        if response.status().is_success() {
            response.json::<LoginResKeycloak>().await
                .map_err(|_| actix_web::error::ErrorInternalServerError("Failed to parse Keycloak response"))
        } else {
            let status = response.status().as_u16();
            let error_body = response.text().await.unwrap_or_else(|_| "Could not read error body".to_string());
            match status {
                400 => Err(actix_web::error::ErrorBadRequest(error_body)),
                401 => Err(actix_web::error::ErrorUnauthorized(error_body)),
                _ => Err(actix_web::error::ErrorInternalServerError(error_body)),
            }
        }
    }
}

#[async_trait::async_trait]
impl UserProvider for KeycloakUserAdapter {
    async fn create_user(&self, req: &CreateUserReq, token: &str) -> Result<CreateUserRes, actix_web::Error> {
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
            .map_err(|_| actix_web::error::ErrorInternalServerError("Failed to call Keycloak"))?;

        let status = response.status().as_u16();
        match status {
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
            409 => Err(actix_web::error::ErrorConflict("Username already exists")),
            401 => Err(actix_web::error::ErrorUnauthorized("Unauthorized")),
            403 => Err(actix_web::error::ErrorForbidden("Forbidden")),
            _ => {
                let body = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
                Err(actix_web::error::ErrorInternalServerError(body))
            }
        }
    }

    async fn get_users(&self, token: &str) -> Result<GetUsersRes, actix_web::Error> {
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
            .map_err(|_| actix_web::error::ErrorInternalServerError("Failed to call Keycloak"))?;

        if response.status().is_success() {
            let users_value = response.json::<Vec<Value>>().await
                .map_err(|_| actix_web::error::ErrorInternalServerError("Failed to parse Keycloak response"))?;

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
            let status = response.status();
            let body = response.text().await.unwrap_or_else(|_| "Could not read error body".to_string());
            Err(actix_web::error::ErrorInternalServerError(format!("{}: {}", status, body)))
        }
    }

    async fn get_user(&self, id: &str, token: &str) -> Result<GetUserRes, actix_web::Error> {
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
            .map_err(|_| actix_web::error::ErrorInternalServerError("Failed to call Keycloak"))?;

        let status = response.status();

        if status.is_success() {
            let user_value = response.json::<Value>().await
                .map_err(|_| actix_web::error::ErrorInternalServerError("Failed to parse Keycloak response"))?;

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
        } else if status.as_u16() == 404 {
            Err(actix_web::error::ErrorNotFound("User not found"))
        } else {
            let body = response.text().await.unwrap_or_else(|_| "Could not read error body".to_string());
            Err(actix_web::error::ErrorInternalServerError(body))
        }
    }

    async fn update_user(&self, id: &str, req: &CreateUserReq, token: &str) -> Result<CreateUserRes, actix_web::Error> {
        let keycloak_url = format!(
            "{}://{}:{}/admin/realms/{}/users/{}",
            env::var("KEYCLOAK_INTERNAL_PROTOCOL").unwrap(),
            env::var("KEYCLOAK_INTERNAL_HOST").unwrap(),
            env::var("KEYCLOAK_INTERNAL_API_PORT").unwrap(),
            env::var("KEYCLOAK_REALM").unwrap(),
            id
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
            .put(&keycloak_url)
            .header("Authorization", token)
            .json(&user_body)
            .send()
            .await
            .map_err(|_| actix_web::error::ErrorInternalServerError("Failed to call Keycloak"))?;

        let status = response.status().as_u16();
        match status {
            200 | 204 => Ok(CreateUserRes {
                id: id.to_string(),
                username: req.username.clone(),
                first_name: req.first_name.clone(),
                last_name: req.last_name.clone(),
                enabled: true,
            }),
            404 => Err(actix_web::error::ErrorNotFound("User not found")),
            401 => Err(actix_web::error::ErrorUnauthorized("Unauthorized")),
            403 => Err(actix_web::error::ErrorForbidden("Forbidden")),
            _ => {
                let body = response.text().await.unwrap_or_else(|_| "Unknown error".to_string());
                Err(actix_web::error::ErrorInternalServerError(body))
            }
        }
    }

    async fn update_password(&self, id: &str, password: &str, token: &str) -> Result<(), actix_web::Error> {
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
            .map_err(|_| actix_web::error::ErrorInternalServerError("Failed to call Keycloak"))?;

        let status = response.status();
        if status.is_success() {
            Ok(())
        } else if status.as_u16() == 404 {
            Err(actix_web::error::ErrorNotFound("User not found"))
        } else {
            let body = response.text().await.unwrap_or_else(|_| "Could not read error body".to_string());
            Err(actix_web::error::ErrorInternalServerError(body))
        }
    }

    async fn delete_user(&self, id: &str, token: &str) -> Result<(), actix_web::Error> {
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
            .map_err(|_| actix_web::error::ErrorInternalServerError("Failed to call Keycloak"))?;

        let status = response.status();
        if status.is_success() {
            Ok(())
        } else if status.as_u16() == 404 {
            Err(actix_web::error::ErrorNotFound("User not found"))
        } else {
            let body = response.text().await.unwrap_or_else(|_| "Could not read error body".to_string());
            Err(actix_web::error::ErrorInternalServerError(body))
        }
    }
}

#[async_trait::async_trait]
impl RoleProvider for KeycloakRoleAdapter {
    async fn get_roles(&self, token: &str) -> Result<GetAllRolesRes, actix_web::Error> {
        let keycloak_url = format!(
            "{}://{}:{}/admin/realms/{}/roles",
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
            .map_err(|_| actix_web::error::ErrorInternalServerError("Failed to call Keycloak"))?;

        if response.status().is_success() {
            let roles_value = response.json::<Vec<serde_json::Value>>().await
                .map_err(|_| actix_web::error::ErrorInternalServerError("Failed to parse Keycloak response"))?;

            let roles_vec: Vec<GetRoleRes> = roles_value.into_iter().map(|role_value| {
                let id = role_value.get("id").and_then(|v| v.as_str()).unwrap_or("").to_string();
                let name = role_value.get("name").and_then(|v| v.as_str()).unwrap_or("").to_string();
                let description = role_value.get("description").and_then(|v| v.as_str()).unwrap_or("").to_string();

                GetRoleRes { id, name, description }
            }).collect();

            Ok(GetAllRolesRes { roles: roles_vec })
        } else {
            let status = response.status();
            let body = response.text().await.unwrap_or_else(|_| "Could not read error body".to_string());
            Err(actix_web::error::ErrorInternalServerError(format!("{}: {}", status, body)))
        }
    }
    
    async fn get_role(&self, id: &str, token: &str) -> Result<GetRoleRes, actix_web::Error> {
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
            .map_err(|_| actix_web::error::ErrorInternalServerError("Failed to call Keycloak"))?;

        let status = response.status();

        if status.is_success() {
            let value = response.json::<serde_json::Value>().await
                .map_err(|_| actix_web::error::ErrorInternalServerError("Failed to parse Keycloak response"))?;

            let id = value.get("id").and_then(|v| v.as_str()).unwrap_or("").to_string();
            let name = value.get("name").and_then(|v| v.as_str()).unwrap_or("").to_string();
            let description = value.get("description").and_then(|v| v.as_str()).unwrap_or("").to_string();

            Ok(GetRoleRes { id, name, description })
        } else if status.as_u16() == 404 {
            Err(actix_web::error::ErrorNotFound("Role not found"))
        } else {
            let body = response.text().await.unwrap_or_else(|_| "Could not read error body".to_string());
            Err(actix_web::error::ErrorInternalServerError(body))
        }
    }
}