use actix_web::{delete, get, patch, post, put, web, HttpRequest, HttpResponse};
use crate::core::dtos::req::create_role_req::CreateRoleReq;
use crate::core::dtos::req::update_role_partial_req::UpdateRolePartialReq;
use crate::adapters::keycloak::keycloak_adapter::KeycloakRoleAdapter;
use crate::core::services::role_service::{get_roles_service, get_role_service, create_role_service,
                                        update_role_service, delete_role_service, patch_role_service};
use crate::core::error::AppError;

fn extract_token(req: &HttpRequest) -> Result<String, AppError> {
    req.headers()
        .get("Authorization")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string())
        .ok_or(AppError::InvalidToken)
}

#[post("/roles")]
pub async fn create_role_controller(token_req: HttpRequest, web::Json(payload): web::Json<CreateRoleReq>) -> Result<HttpResponse, AppError> {
    let token = extract_token(&token_req)?;
    let provider = KeycloakRoleAdapter;
    let res = create_role_service(&provider, &payload, &token).await?;
    Ok(HttpResponse::Created().json(res))
}

#[get("/roles")]
pub async fn get_roles_controller(token_req: HttpRequest) -> Result<HttpResponse, AppError> {
    let token = extract_token(&token_req)?;
    let provider = KeycloakRoleAdapter;
    let res = get_roles_service(&provider, &token).await?;
    Ok(HttpResponse::Ok().json(res))
}

#[get("/roles/{id}")]
pub async fn get_role_controller(token_req: HttpRequest, path: web::Path<String>) -> Result<HttpResponse, AppError> {
    let id = path.into_inner();
    let token = extract_token(&token_req)?;
    let provider = KeycloakRoleAdapter;
    let res = get_role_service(&provider, &id, &token).await?;
    Ok(HttpResponse::Ok().json(res))
}

#[put("/roles/{id}")]
pub async fn update_role_controller(
    token_req: HttpRequest,
    path: web::Path<String>,
    web::Json(payload): web::Json<CreateRoleReq>,
) -> Result<HttpResponse, AppError> {
    let id = path.into_inner();
    let token = extract_token(&token_req)?;
    let provider = KeycloakRoleAdapter;
    update_role_service(&provider, &id, &payload, &token).await?;
    Ok(HttpResponse::Ok().finish())
}

#[patch("/roles/{id}")]
pub async fn patch_role_controller(
    token_req: HttpRequest,
    path: web::Path<String>,
    web::Json(payload): web::Json<UpdateRolePartialReq>,
) -> Result<HttpResponse, AppError> {
    let id = path.into_inner();
    let token = extract_token(&token_req)?;
    let provider = KeycloakRoleAdapter;
    let updated = patch_role_service(&provider, &id, &payload, &token).await?;
    Ok(HttpResponse::Ok().json(updated))
}

#[delete("/roles/{id}")]
pub async fn delete_role_controller(token_req: HttpRequest, path: web::Path<String>) -> Result<HttpResponse, AppError> {
    let id = path.into_inner();
    let token = extract_token(&token_req)?;
    let provider = KeycloakRoleAdapter;
    delete_role_service(&provider, &id, &token).await?;
    Ok(HttpResponse::NoContent().finish())
}