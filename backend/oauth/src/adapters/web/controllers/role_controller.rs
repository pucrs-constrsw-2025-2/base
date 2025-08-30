use actix_web::{get, HttpRequest, HttpResponse, Result};
use crate::adapters::keycloak::keycloak_adapter::KeycloakRoleAdapter;
use crate::core::services::role_service::get_roles_service;

#[get("/roles")]
pub async fn get_roles_controller(token_req: HttpRequest) -> Result<HttpResponse> {
    let token = match token_req.headers().get("Authorization").and_then(|v| v.to_str().ok()) {
        Some(s) if !s.is_empty() => s.to_string(),
        _ => return Ok(HttpResponse::Unauthorized().body("Missing Authorization header")),
    };

    let provider = KeycloakRoleAdapter;
    match get_roles_service(&provider, &token).await {
        Ok(res) => Ok(HttpResponse::Ok().json(res)),
        Err(e) => Err(e),
    }
}