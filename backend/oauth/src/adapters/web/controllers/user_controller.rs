use actix_web::{delete, get, patch, post, put, web, HttpRequest, HttpResponse};
use serde_json::Value;
use crate::core::dtos::req::create_user_req::CreateUserReq;
use crate::core::dtos::req::update_user_req::UpdateUserReq;
use crate::adapters::keycloak::keycloak_adapter::KeycloakUserAdapter;
use crate::core::services::user_service::{ create_user_service, get_users_service, get_user_service,
                                            update_user_service, update_password_service, delete_user_service };
use crate::core::error::AppError;

fn extract_token(req: &HttpRequest) -> Result<String, AppError> {
    req.headers()
        .get("Authorization")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string())
        .ok_or(AppError::InvalidToken)
}

#[post("/users")]
pub async fn create_user_controller(token_req: HttpRequest, web::Json(payload): web::Json<CreateUserReq>) -> Result<HttpResponse, AppError> {
    let token = extract_token(&token_req)?;
    let provider = KeycloakUserAdapter;
    let res = create_user_service(&provider, &payload, &token).await?;
    Ok(HttpResponse::Created().json(res))
}

#[get("/users")]
pub async fn get_users_controller(token_req: HttpRequest) -> Result<HttpResponse, AppError> {
    let token = extract_token(&token_req)?;
    let provider = KeycloakUserAdapter;
    let res = get_users_service(&provider, &token).await?;
    Ok(HttpResponse::Ok().json(res))
}

#[get("/users/{id}")]
pub async fn get_user_controller(token_req: HttpRequest, path: web::Path<String>) -> Result<HttpResponse, AppError> {
    let id = path.into_inner();
    let token = extract_token(&token_req)?;
    let provider = KeycloakUserAdapter;
    let res = get_user_service(&provider, &id, &token).await?;
    Ok(HttpResponse::Ok().json(res))
}

#[put("/users/{id}")]
pub async fn update_user_controller(
    token_req: HttpRequest,
    path: web::Path<String>,
    web::Json(payload): web::Json<UpdateUserReq>,
) -> Result<HttpResponse, AppError> {
    let id = path.into_inner();
    let token = extract_token(&token_req)?;
    let provider = KeycloakUserAdapter;
    let res = update_user_service(&provider, &id, &payload, &token).await?;
    Ok(HttpResponse::Ok().json(res))
}

#[patch("/users/{id}")]
pub async fn update_password_controller(
    token_req: HttpRequest,
    path: web::Path<String>,
    web::Json(payload): web::Json<Value>,
) -> Result<HttpResponse, AppError> {
    let id = path.into_inner();
    let token = extract_token(&token_req)?;

    let password = payload.get("password")
        .and_then(|v| v.as_str())
        .ok_or_else(|| AppError::ValidationError { details: "Missing password field".to_string() })?;

    let provider = KeycloakUserAdapter;
    update_password_service(&provider, &id, password, &token).await?;
    Ok(HttpResponse::Ok().finish())
}

#[delete("/users/{id}")]
pub async fn delete_user_controller(token_req: HttpRequest, path: web::Path<String>) -> Result<HttpResponse, AppError> {
    let id = path.into_inner();
    let token = extract_token(&token_req)?;
    let provider = KeycloakUserAdapter;
    delete_user_service(&provider, &id, &token).await?;
    Ok(HttpResponse::NoContent().finish())
}