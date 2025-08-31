use actix_web::{post, web, HttpResponse};
use crate::core::dtos::req::login_req::LoginReq;
use crate::core::dtos::res::login_res::LoginRes;
use crate::core::services::general_service::login_service;
use crate::adapters::keycloak::keycloak_adapter::KeycloakAuthAdapter;
use crate::core::error::AppError;

#[utoipa::path(
    post,
    tag = "general",
    path = "/login",
    request_body(
        content = LoginReq,
        description = "Credenciais de login",
        content_type = "application/x-www-form-urlencoded"
    ),
    responses(
        (status = 201, description = "Login realizado", body = LoginRes),
        (status = 400, description = "Erro de validação"),
        (status = 401, description = "Credenciais inválidas"),
        (status = 500, description = "Erro interno ou serviço externo")
    )
)]
#[post("/login")]
pub async fn login_controller(web::Form(form): web::Form<LoginReq>) -> Result<HttpResponse, AppError> {
    let adapter = KeycloakAuthAdapter;
    let res = login_service(&adapter, &form).await?;
    Ok(HttpResponse::Created().json(res))
}