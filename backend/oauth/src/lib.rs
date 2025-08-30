pub mod adapters;
pub mod core;
pub use core::dtos::*;
use actix_web::{get, post, put, web, HttpRequest, HttpResponse, Responder, Result};
use reqwest::Client;
use std::env;

//ROLES
use core::dtos::req::create_role_req::CreateRoleReq;
use core::dtos::res::get_role_res::GetRoleRes;
use core::dtos::res::get_all_roles_res::GetAllRolesRes;

#[get("/")]
pub async fn hello() -> impl Responder {
    
    HttpResponse::Ok().body("Hello, Actix!")
}

//ROLES
#[put("/roles/{id}")]
pub async fn update_role(
    token_req: HttpRequest,
    path: web::Path<String>,
    web::Json(payload): web::Json<CreateRoleReq>,
) -> Result<impl Responder> {
    let id = path.into_inner();

    // Require Authorization
    let auth = match token_req.headers().get("Authorization").and_then(|v| v.to_str().ok()) {
        Some(s) if !s.is_empty() => s.to_string(),
        _ => return Ok(HttpResponse::Unauthorized().body("Missing Authorization header")),
    };

    // Build Keycloak base URL
    let keycloak_url = match (
        env::var("KEYCLOAK_INTERNAL_PROTOCOL"),
        env::var("KEYCLOAK_INTERNAL_HOST"),
        env::var("KEYCLOAK_INTERNAL_API_PORT"),
    ) {
        (Ok(protocol), Ok(host), Ok(port)) => Ok(format!("{}://{}:{}", protocol, host, port)),
        _ => Err(actix_web::error::ErrorInternalServerError("Keycloak URL configuration is missing")),
    }?;
    let realm = env::var("KEYCLOAK_REALM")
        .map_err(|_| actix_web::error::ErrorInternalServerError("Missing KEYCLOAK_REALM"))?;

    // Keycloak endpoint for updating role by id
    let url = format!("{}/admin/realms/{}/roles-by-id/{}", keycloak_url, realm, id);

    // Build body for Keycloak
    let role_body = serde_json::json!({
        "id": id,
        "name": payload.name,
        "composite": payload.composite,
        "clientRole": payload.client_role,
        "containerId": payload.container_id
    });

    let client = Client::new();
    let response = client
        .put(&url)
        .header("Authorization", auth)
        .json(&role_body)
        .send()
        .await
        .map_err(|_| actix_web::error::ErrorInternalServerError("Failed to call Keycloak"))?;

    let status = response.status().as_u16();
    match status {
        204 | 200 => Ok(HttpResponse::Ok().finish()),
        404 => {
            let body = response.text().await.unwrap_or_else(|_| "Not found".to_string());
            Ok(HttpResponse::NotFound().body(body))
        }
        401 => {
            let body = response.text().await.unwrap_or_else(|_| "Unauthorized".to_string());
            Ok(HttpResponse::Unauthorized().body(body))
        }
        403 => {
            let body = response.text().await.unwrap_or_else(|_| "Forbidden".to_string());
            Ok(HttpResponse::Forbidden().body(body))
        }
        s => {
            let body = response.text().await.unwrap_or_else(|_| "Could not read error body".to_string());
            Ok(HttpResponse::build(actix_web::http::StatusCode::from_u16(s).unwrap()).body(body))
        }
    }
}