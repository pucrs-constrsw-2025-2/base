use actix_web::{delete, get, patch, post, put, web, HttpRequest, HttpResponse};
use crate::core::dtos::req::create_user_req::CreateUserReq;
use crate::core::dtos::req::update_user_req::UpdateUserReq;
use crate::core::dtos::req::assign_role_req::AssignRoleReq;
use crate::adapters::keycloak::keycloak_adapter::KeycloakUserAdapter;
use crate::core::services::user_service::{ create_user_service, get_users_service, get_user_service,
                                            update_user_service, update_password_service, delete_user_service,
                                            add_role_to_user_service, remove_role_from_user_service };
use crate::core::error::AppError;
use crate::core::dtos::res::create_user_res::CreateUserRes;
use crate::core::dtos::res::get_user_res::GetUserRes;
use crate::core::dtos::res::get_all_users_res::GetUsersRes;
use utoipa::ToSchema;

// Novo DTO simples para documentar atualização de senha
#[derive(serde::Deserialize, serde::Serialize, ToSchema)]
pub struct PasswordUpdateReq {
    pub password: String
}

fn extract_token(req: &HttpRequest) -> Result<String, AppError> {
    req.headers()
        .get("Authorization")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string())
        .ok_or(AppError::InvalidToken { code: 401 })
}

// Corrigido: adicionados método, path, tag, tipos corretos
#[utoipa::path(
    post,
    path = "/users",
    tag = "users",
    request_body(
        content = CreateUserReq,
        content_type = "application/json",
        description = "Payload para criação de usuário"
    ),
    responses(
        (status = 201, description = "User created", body = CreateUserRes),
        (status = 400, description = "Validation error"),
        (status = 401, description = "Unauthorized")
    ),
    security(("bearerAuth" = []))
)]
#[post("/users")]
pub async fn create_user_controller(token_req: HttpRequest, web::Json(payload): web::Json<CreateUserReq>) -> Result<HttpResponse, AppError> {
    let token = extract_token(&token_req)?;
    let provider = KeycloakUserAdapter;
    let res = create_user_service(&provider, &payload, &token).await?;
    Ok(HttpResponse::Created().json(res))
}

#[utoipa::path(
    get,
    path = "/users",
    tag = "users",
    responses(
        (status = 200, description = "Users list", body = GetUsersRes),
        (status = 401, description = "Unauthorized")
    ),
    security(("bearerAuth" = []))
)]
#[get("/users")]
pub async fn get_users_controller(token_req: HttpRequest) -> Result<HttpResponse, AppError> {
    let token = extract_token(&token_req)?;
    let provider = KeycloakUserAdapter;
    let res = get_users_service(&provider, &token).await?;
    Ok(HttpResponse::Ok().json(res))
}

#[utoipa::path(
    get,
    path = "/users/{id}",
    tag = "users",
    params(
        ("id" = String, Path, description = "User ID")
    ),
    responses(
        (status = 200, description = "User details", body = GetUserRes),
        (status = 401, description = "Unauthorized"),
        (status = 404, description = "User not found")
    ),
    security(("bearerAuth" = []))
)]
#[get("/users/{id}")]
pub async fn get_user_controller(token_req: HttpRequest, path: web::Path<String>) -> Result<HttpResponse, AppError> {
    let id = path.into_inner();
    let token = extract_token(&token_req)?;
    let provider = KeycloakUserAdapter;
    let res = get_user_service(&provider, &id, &token).await?;
    Ok(HttpResponse::Ok().json(res))
}

#[utoipa::path(
    put,
    path = "/users/{id}",
    tag = "users",
    params(
        ("id" = String, Path, description = "User ID")
    ),
    request_body(
        content = UpdateUserReq,
        content_type = "application/json",
        description = "Dados para atualização completa do usuário"
    ),
    responses(
        (status = 200, description = "User updated", body = GetUserRes),
        (status = 400, description = "Validation error"),
        (status = 401, description = "Unauthorized"),
        (status = 404, description = "User not found")
    ),
    security(("bearerAuth" = []))
)]
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

// Ajustado para usar PasswordUpdateReq
#[utoipa::path(
    patch,
    path = "/users/{id}",
    tag = "users",
    params(
        ("id" = String, Path, description = "User ID")
    ),
    request_body(
        content = PasswordUpdateReq,
        content_type = "application/json",
        description = "Objeto contendo o novo password"
    ),
    responses(
        (status = 200, description = "Password updated"),
        (status = 400, description = "Validation error"),
        (status = 401, description = "Unauthorized"),
        (status = 404, description = "User not found")
    ),
    security(("bearerAuth" = []))
)]
#[patch("/users/{id}")]
pub async fn update_password_controller(
    token_req: HttpRequest,
    path: web::Path<String>,
    web::Json(payload): web::Json<PasswordUpdateReq>,
) -> Result<HttpResponse, AppError> {
    let id = path.into_inner();
    let token = extract_token(&token_req)?;
    let provider = KeycloakUserAdapter;
    update_password_service(&provider, &id, &payload.password, &token).await?;
    Ok(HttpResponse::Ok().finish())
}

#[utoipa::path(
    delete,
    path = "/users/{id}",
    tag = "users",
    params(
        ("id" = String, Path, description = "User ID")
    ),
    responses(
        (status = 204, description = "User deleted"),
        (status = 401, description = "Unauthorized"),
        (status = 404, description = "User not found")
    ),
    security(("bearerAuth" = []))
)]
#[delete("/users/{id}")]
pub async fn delete_user_controller(token_req: HttpRequest, path: web::Path<String>) -> Result<HttpResponse, AppError> {
    let id = path.into_inner();
    let token = extract_token(&token_req)?;
    let provider = KeycloakUserAdapter;
    delete_user_service(&provider, &id, &token).await?;
    Ok(HttpResponse::NoContent().finish())
}

#[utoipa::path(
    post,
    path = "/users/{user_id}/roles",
    tag = "users",
    params(
        ("user_id" = String, Path, description = "User ID")
    ),
    request_body(
        content = AssignRoleReq,
        content_type = "application/json",
        description = "Role a ser atribuída"
    ),
    responses(
        (status = 204, description = "Role assigned"),
        (status = 400, description = "Validation error"),
        (status = 401, description = "Unauthorized"),
        (status = 404, description = "User or role not found")
    ),
    security(("bearerAuth" = []))
)]
#[post("/users/{user_id}/roles")]
pub async fn add_role_to_user_controller(
    token_req: HttpRequest,
    path: web::Path<String>,
    web::Json(payload): web::Json<AssignRoleReq>,
) -> Result<HttpResponse, AppError> {
    let user_id = path.into_inner();
    let token = extract_token(&token_req)?;
    let provider = KeycloakUserAdapter;
    add_role_to_user_service(&provider, &user_id, &payload.role_id, &token).await?;
    Ok(HttpResponse::NoContent().finish())
}

#[utoipa::path(
    delete,
    path = "/users/{user_id}/roles/{role_id}",
    tag = "users",
    params(
        ("user_id" = String, Path, description = "User ID"),
        ("role_id" = String, Path, description = "Role ID")
    ),
    responses(
        (status = 204, description = "Role removed"),
        (status = 401, description = "Unauthorized"),
        (status = 404, description = "User or role not found")
    ),
    security(("bearerAuth" = []))
)]
#[delete("/users/{user_id}/roles/{role_id}")]
pub async fn remove_role_from_user_controller(
    token_req: HttpRequest,
    path: web::Path<(String, String)>,
) -> Result<HttpResponse, AppError> {
    let (user_id, role_id) = path.into_inner();
    let token = extract_token(&token_req)?;
    let provider = KeycloakUserAdapter;
    remove_role_from_user_service(&provider, &user_id, &role_id, &token).await?;
    Ok(HttpResponse::NoContent().finish())
}