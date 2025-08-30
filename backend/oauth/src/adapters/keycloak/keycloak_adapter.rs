use crate::core::dtos::req::login_req::LoginReqKeycloak;
use crate::core::dtos::res::login_res::LoginResKeycloak;
use crate::core::dtos::req::create_user_req::CreateUserReq;
use crate::core::dtos::res::create_user_res::CreateUserRes;
use crate::core::interfaces::auth_provider::AuthProvider;
use crate::core::interfaces::user_provider::UserProvider;
use serde_json::json;
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
}