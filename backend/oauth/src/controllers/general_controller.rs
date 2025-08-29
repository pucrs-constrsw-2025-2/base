use actix_web::{post, web, HttpResponse, Result};
use crate::dtos::req::login_req::LoginReq;
use crate::services::general_service::login_service;
use crate::adapters::keycloak_adapter::KeycloakAdapter;

#[post("/login")]
pub async fn login_controller(web::Form(form): web::Form<LoginReq>) -> Result<HttpResponse> {
    let adapter = KeycloakAdapter;
    match login_service(&adapter, &form).await {
        Ok(res) => Ok(HttpResponse::Created().json(res)),
        Err(e) => Err(e),
    }
}