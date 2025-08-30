use crate::core::dtos::req::login_req::LoginReqKeycloak;
use crate::core::dtos::res::login_res::LoginResKeycloak;
use crate::core::interfaces::auth_provider::AuthProvider;
use reqwest::Client;
use std::env;

pub struct KeycloakAdapter;

#[async_trait::async_trait]
impl AuthProvider for KeycloakAdapter {
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