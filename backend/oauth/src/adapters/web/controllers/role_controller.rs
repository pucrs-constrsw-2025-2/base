use actix_web::{delete, get, patch, post, put, web, HttpRequest, HttpResponse};
use crate::core::dtos::req::create_role_req::CreateRoleReq;
use crate::core::dtos::req::update_role_partial_req::UpdateRolePartialReq;
use crate::adapters::keycloak::keycloak_adapter::KeycloakRoleAdapter;
use crate::core::services::role_service::{get_roles_service, get_role_service, create_role_service,
                                        update_role_service, delete_role_service, patch_role_service};
use crate::core::error::AppError;
use crate::core::dtos::res::get_role_res::GetRoleRes;
use crate::core::dtos::res::get_all_roles_res::GetAllRolesRes;

fn extract_token(req: &HttpRequest) -> Result<String, AppError> {
    req.headers()
        .get("Authorization")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string())
        .ok_or(AppError::InvalidToken { code: 401 })
}

#[utoipa::path(
    post,
    path = "/roles",
    tag = "roles",
    request_body(
        content = CreateRoleReq,
        content_type = "application/json",
        description = "Dados para criação de uma role"
    ),
    responses(
        (status = 201, description = "Role criada", body = GetRoleRes),
        (status = 400, description = "Erro de validação"),
        (status = 401, description = "Não autorizado"),
        (status = 409, description = "Conflito")
    ),
    security(("bearerAuth" = []))
)]
#[post("/roles")]
pub async fn create_role_controller(token_req: HttpRequest, web::Json(payload): web::Json<CreateRoleReq>) -> Result<HttpResponse, AppError> {
    let token = extract_token(&token_req)?;
    let provider = KeycloakRoleAdapter;
    let res = create_role_service(&provider, &payload, &token).await?;
    Ok(HttpResponse::Created().json(res))
}

#[utoipa::path(
    get,
    path = "/roles",
    tag = "roles",
    responses(
        (status = 200, description = "Lista de roles", body = GetAllRolesRes),
        (status = 401, description = "Não autorizado")
    ),
    security(("bearerAuth" = []))
)]
#[get("/roles")]
pub async fn get_roles_controller(token_req: HttpRequest) -> Result<HttpResponse, AppError> {
    let token = extract_token(&token_req)?;
    let provider = KeycloakRoleAdapter;
    let res = get_roles_service(&provider, &token).await?;
    Ok(HttpResponse::Ok().json(res))
}

#[utoipa::path(
    get,
    path = "/roles/{id}",
    tag = "roles",
    params(
        ("id" = String, Path, description = "ID da role")
    ),
    responses(
        (status = 200, description = "Detalhes da role", body = GetRoleRes),
        (status = 401, description = "Não autorizado"),
        (status = 404, description = "Role não encontrada")
    ),
    security(("bearerAuth" = []))
)]
#[get("/roles/{id}")]
pub async fn get_role_controller(token_req: HttpRequest, path: web::Path<String>) -> Result<HttpResponse, AppError> {
    let id = path.into_inner();
    let token = extract_token(&token_req)?;
    let provider = KeycloakRoleAdapter;
    let res = get_role_service(&provider, &id, &token).await?;
    Ok(HttpResponse::Ok().json(res))
}

#[utoipa::path(
    put,
    path = "/roles/{id}",
    tag = "roles",
    params(
        ("id" = String, Path, description = "ID da role")
    ),
    request_body(
        content = CreateRoleReq,
        content_type = "application/json",
        description = "Dados completos para atualizar a role"
    ),
    responses(
        (status = 200, description = "Role atualizada"),
        (status = 400, description = "Erro de validação"),
        (status = 401, description = "Não autorizado"),
        (status = 404, description = "Role não encontrada")
    ),
    security(("bearerAuth" = []))
)]
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

#[utoipa::path(
    patch,
    path = "/roles/{id}",
    tag = "roles",
    params(
        ("id" = String, Path, description = "ID da role")
    ),
    request_body(
        content = UpdateRolePartialReq,
        content_type = "application/json",
        description = "Campos parciais para atualizar a role"
    ),
    responses(
        (status = 200, description = "Role atualizada parcialmente", body = GetRoleRes),
        (status = 400, description = "Erro de validação"),
        (status = 401, description = "Não autorizado"),
        (status = 404, description = "Role não encontrada")
    ),
    security(("bearerAuth" = []))
)]
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

#[utoipa::path(
    delete,
    path = "/roles/{id}",
    tag = "roles",
    params(
        ("id" = String, Path, description = "ID da role")
    ),
    responses(
        (status = 204, description = "Role removida"),
        (status = 401, description = "Não autorizado"),
        (status = 404, description = "Role não encontrada")
    ),
    security(("bearerAuth" = []))
)]
#[delete("/roles/{id}")]
pub async fn delete_role_controller(token_req: HttpRequest, path: web::Path<String>) -> Result<HttpResponse, AppError> {
    let id = path.into_inner();
    let token = extract_token(&token_req)?;
    let provider = KeycloakRoleAdapter;
    delete_role_service(&provider, &id, &token).await?;
    Ok(HttpResponse::NoContent().finish())
}