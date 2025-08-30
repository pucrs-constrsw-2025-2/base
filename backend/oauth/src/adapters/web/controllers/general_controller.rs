use actix_web::{post, web, HttpResponse};
use crate::core::dtos::req::login_req::LoginReq;
use crate::core::services::general_service::login_service;
use crate::adapters::keycloak::keycloak_adapter::KeycloakAuthAdapter;
use crate::core::error::AppError;

#[post("/login")]
pub async fn login_controller(web::Form(form): web::Form<LoginReq>) -> Result<HttpResponse, AppError> {
    let adapter = KeycloakAuthAdapter;
    let res = login_service(&adapter, &form).await?;
    Ok(HttpResponse::Created().json(res))
}