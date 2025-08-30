use actix_web::{delete, get, post, put, web, HttpRequest, HttpResponse, Result};
use crate::core::dtos::req::create_role_req::CreateRoleReq;
use crate::adapters::keycloak::keycloak_adapter::KeycloakRoleAdapter;
use crate::core::services::role_service::{get_roles_service, get_role_service, create_role_service,
                                        update_role_service, delete_role_service};

#[post("/roles")]
pub async fn create_role_controller(token_req: HttpRequest, web::Json(payload): web::Json<CreateRoleReq>) -> Result<HttpResponse> {
    let token = match token_req.headers().get("Authorization").and_then(|v| v.to_str().ok()) {
        Some(s) if !s.is_empty() => s.to_string(),
        _ => return Ok(HttpResponse::Unauthorized().body("Missing Authorization header")),
    };

    let provider = KeycloakRoleAdapter;
    match create_role_service(&provider, &payload, &token).await {
        Ok(res) => Ok(HttpResponse::Created().json(res)),
        Err(e) => Err(e),
    }
}

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

#[put("/roles/{id}")]
pub async fn update_role_controller(
    token_req: HttpRequest,
    path: web::Path<String>,
    web::Json(payload): web::Json<CreateRoleReq>,
) -> Result<HttpResponse> {
    let id = path.into_inner();
    let token = match token_req.headers().get("Authorization").and_then(|v| v.to_str().ok()) {
        Some(s) if !s.is_empty() => s.to_string(),
        _ => return Ok(HttpResponse::Unauthorized().body("Missing Authorization header")),
    };

    let provider = KeycloakRoleAdapter;
    match update_role_service(&provider, &id, &payload, &token).await {
        Ok(_) => Ok(HttpResponse::Ok().finish()),
        Err(e) => Err(e),
    }
}

#[delete("/roles/{id}")]
pub async fn delete_role_controller(token_req: HttpRequest, path: web::Path<String>) -> Result<HttpResponse> {
    let id = path.into_inner();
    let token = match token_req.headers().get("Authorization").and_then(|v| v.to_str().ok()) {
        Some(s) if !s.is_empty() => s.to_string(),
        _ => return Ok(HttpResponse::Unauthorized().body("Missing Authorization header")),
    };
    let provider = KeycloakRoleAdapter;
    match delete_role_service(&provider, &id, &token).await {
        Ok(_) => Ok(HttpResponse::NoContent().finish()),
        Err(e) => Err(e),
    }
}