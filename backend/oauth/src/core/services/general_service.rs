use crate::core::dtos::req::login_req::{LoginReq, LoginReqKeycloak};
use crate::core::dtos::res::login_res::LoginRes;
use crate::core::interfaces::auth_provider::AuthProvider;
use crate::core::validators::login_validator::validate_login;
use crate::core::error::AppError;
use std::env;

pub async fn login_service<P: AuthProvider>(
    provider: &P,
    form: &LoginReq,
) -> Result<LoginRes, AppError> {
    if let Err(errors) = validate_login(form) {
        return Err(AppError::ValidationError { details: errors.join(", ") });
    }

    let client_id = env::var("KEYCLOAK_CLIENT_ID").unwrap();
    let client_secret = env::var("KEYCLOAK_CLIENT_SECRET").unwrap();

    let keycloak_request = LoginReqKeycloak {
        client_id,
        client_secret,
        username: form.username.clone(),
        password: form.password.clone(),
        grant_type: "password".to_string(),
    };

    let keycloak_response = provider.login(&keycloak_request).await?;

    Ok(LoginRes {
        token_type: keycloak_response.token_type,
        access_token: keycloak_response.access_token,
        expires_in: keycloak_response.expires_in.try_into().unwrap_or(0),
        refresh_token: keycloak_response.refresh_token,
        refresh_expires_in: keycloak_response.refresh_expires_in.try_into().unwrap_or(0),
    })
}