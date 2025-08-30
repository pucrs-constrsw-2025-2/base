use actix_web::{get, web, HttpRequest, HttpResponse, Result};
use crate::adapters::keycloak::keycloak_adapter::KeycloakRoleAdapter;
use crate::core::services::role_service::{get_roles_service, get_role_service};

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

#[get("/roles/{id}")]
pub async fn get_role_controller(token_req: HttpRequest, path: web::Path<String>) -> Result<HttpResponse> {
    let id = path.into_inner();
    let token = match token_req.headers().get("Authorization").and_then(|v| v.to_str().ok()) {
        Some(s) if !s.is_empty() => s.to_string(),
        _ => return Ok(HttpResponse::Unauthorized().body("Missing Authorization header")),
    };

    let provider = KeycloakRoleAdapter;
    match get_role_service(&provider, &id, &token).await {
        Ok(res) => Ok(HttpResponse::Ok().json(res)),
        Err(e) => Err(e),
    }
}