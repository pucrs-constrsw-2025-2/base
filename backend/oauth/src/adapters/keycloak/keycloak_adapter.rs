use crate::core::dtos::req::login_req::LoginReqKeycloak;
use crate::core::dtos::res::login_res::LoginResKeycloak;
use crate::core::dtos::req::create_user_req::CreateUserReq;
use crate::core::dtos::res::create_user_res::CreateUserRes;
use crate::core::dtos::res::get_all_users_res::GetUsersRes;
use crate::core::dtos::res::get_user_res::GetUserRes;
use crate::core::interfaces::auth_provider::AuthProvider;
use crate::core::interfaces::user_provider::UserProvider;
use serde_json::{ json, Value };
use reqwest::Client;
use std::env;

pub struct KeycloakAuthAdapter;
pub struct KeycloakUserAdapter;

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
}