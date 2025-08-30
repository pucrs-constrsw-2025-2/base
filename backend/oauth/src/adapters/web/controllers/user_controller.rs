use actix_web::{post, web, HttpRequest, HttpResponse, Result};
use crate::core::dtos::req::create_user_req::CreateUserReq;
use crate::adapters::keycloak::keycloak_adapter::KeycloakUserAdapter;
use crate::core::services::user_service::create_user_service;

#[post("/users")]
pub async fn create_user_controller(token_req: HttpRequest, web::Json(payload): web::Json<CreateUserReq>) -> Result<HttpResponse> {
    let token = match token_req.headers().get("Authorization").and_then(|v| v.to_str().ok()) {
        Some(s) if !s.is_empty() => s.to_string(),
        _ => return Ok(HttpResponse::Unauthorized().body("Missing Authorization header")),
    };

    let provider = KeycloakUserAdapter;
    match create_user_service(&provider, &payload, &token).await {
        Ok(res) => Ok(HttpResponse::Created().json(res)),
        Err(e) => Err(e),
    }
}