pub mod adapters;
pub mod core;
pub use core::dtos::*;
use actix_web::{delete, get, patch, post, put, web, HttpRequest, HttpResponse, Responder, Result};
use serde_json::{json, Value};
use reqwest::Client;
use std::env;

//USERS
use core::dtos::res::get_user_res::GetUserRes;
use core::dtos::res::get_all_users_res::GetUsersRes;
//ROLES
use core::dtos::req::create_role_req::CreateRoleReq;
use core::dtos::res::get_role_res::GetRoleRes;
use core::dtos::res::get_all_roles_res::GetAllRolesRes;

#[get("/")]
pub async fn hello() -> impl Responder {
    
    HttpResponse::Ok().body("Hello, Actix!")
}

#[get("/users/{id}")]
pub async fn get_user(token_req: HttpRequest, path: web::Path<String>) -> Result<impl Responder> {

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

    let url = format!("{}/admin/realms/{}/users/{}", keycloak_url, realm, id);

    let client = Client::new();
    let response = client
        .get(&url)
        .header("Authorization", auth)
        .send()
        .await
        .map_err(|_| actix_web::error::ErrorInternalServerError("Failed to call Keycloak"))?;

    let status = response.status();

    if status.is_success() {
        let user_value = response.json::<Value>().await
            .map_err(|_| actix_web::error::ErrorInternalServerError("Failed to parse Keycloak response"))?;

        // Map Keycloak fields to DTO
        let id = user_value.get("id").and_then(|v| v.as_str()).unwrap_or("").to_string();

        let username = user_value
            .get("username")
            .and_then(|v| v.as_str())
            .or_else(|| user_value.get("email").and_then(|v| v.as_str()))
            .unwrap_or("")
            .to_string();

        let first_name = user_value
            .get("firstName")
            .or_else(|| user_value.get("first-name"))
            .or_else(|| user_value.get("first_name"))
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_string();

        let last_name = user_value
            .get("lastName")
            .or_else(|| user_value.get("last-name"))
            .or_else(|| user_value.get("last_name"))
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_string();

        let enabled = user_value.get("enabled").and_then(|v| v.as_bool()).unwrap_or(false);

        let dto = GetUserRes {
            id,
            username,
            first_name,
            last_name,
            enabled,
        };

        Ok(HttpResponse::Ok().json(dto))
    } else if status.as_u16() == 404 {
        let body = response.text().await.unwrap_or_else(|_| "Not found".to_string());
        Ok(HttpResponse::NotFound().body(body))
    } else {
        let body = response.text().await.unwrap_or_else(|_| "Could not read error body".to_string());
        Ok(HttpResponse::build(status).body(body))
    }
}

#[put("/users/{id}")]
pub async fn update_user(
    token_req: HttpRequest,
    path: web::Path<String>,
    web::Json(payload): web::Json<Value>,
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

    let url = format!("{}/admin/realms/{}/users/{}", keycloak_url, realm, id);

    let client = Client::new();
    let response = client
        .put(&url)
        .header("Authorization", auth)
        .json(&payload)
        .send()
        .await
        .map_err(|_| actix_web::error::ErrorInternalServerError("Failed to call Keycloak"))?;

    let status = response.status();

    if status.is_success() {
        // Return empty body for success (mapped to 200 OK)
        Ok(HttpResponse::Ok().finish())
    } else if status.as_u16() == 404 {
        let body = response.text().await.unwrap_or_else(|_| "Not found".to_string());
        Ok(HttpResponse::NotFound().body(body))
    } else {
        let body = response.text().await.unwrap_or_else(|_| "Could not read error body".to_string());
        Ok(HttpResponse::build(status).body(body))
    }
}

#[patch("/users/{id}")]
pub async fn patch_user_password(
    token_req: HttpRequest,
    path: web::Path<String>,
    web::Json(payload): web::Json<Value>,
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

    // Expect payload like { "password": "newpass" }
    let new_password = payload.get("password")
        .and_then(|v| v.as_str())
        .ok_or_else(|| actix_web::error::ErrorBadRequest("Missing password field"))?;

    // Keycloak credential representation
    let cred = json!({
        "type": "password",
        "value": new_password,
        "temporary": false
    });

    let url = format!("{}/admin/realms/{}/users/{}/reset-password", keycloak_url, realm, id);

    let client = Client::new();
    let response = client
        .put(&url) // Keycloak expects PUT for reset-password
        .header("Authorization", auth)
        .json(&cred)
        .send()
        .await
        .map_err(|_| actix_web::error::ErrorInternalServerError("Failed to call Keycloak"))?;

    let status = response.status();

    if status.is_success() {
        Ok(HttpResponse::Ok().finish())
    } else if status.as_u16() == 404 {
        let body = response.text().await.unwrap_or_else(|_| "Not found".to_string());
        Ok(HttpResponse::NotFound().body(body))
    } else {
        let body = response.text().await.unwrap_or_else(|_| "Could not read error body".to_string());
        Ok(HttpResponse::build(status).body(body))
    }
}

#[delete("/users/{id}")]
pub async fn delete_user(token_req: HttpRequest, path: web::Path<String>) -> Result<impl Responder> {
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

    let url = format!("{}/admin/realms/{}/users/{}", keycloak_url, realm, id);

    // Send update to Keycloak to disable the user (logical delete)
    let body = json!({ "enabled": false });
    let client = Client::new();
    let response = client
        .put(&url)
        .header("Authorization", auth)
        .json(&body)
        .send()
        .await
        .map_err(|_| actix_web::error::ErrorInternalServerError("Failed to call Keycloak"))?;

    let status = response.status();

    if status.is_success() {
        // map successful update to 204 No Content
        Ok(HttpResponse::NoContent().finish())
    } else if status.as_u16() == 404 {
        let body = response.text().await.unwrap_or_else(|_| "Not found".to_string());
        Ok(HttpResponse::NotFound().body(body))
    } else {
        let body = response.text().await.unwrap_or_else(|_| "Could not read error body".to_string());
        Ok(HttpResponse::build(status).body(body))
    }
}


//ROLES
#[post("/roles")]
pub async fn create_role(token_req: HttpRequest, web::Json(payload): web::Json<CreateRoleReq>) -> Result<impl Responder> {
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

    // Keycloak endpoint for creating roles
    let url = format!("{}/admin/realms/{}/roles", keycloak_url, realm);

    // Build body for Keycloak
    let role_body = serde_json::json!({
        "name": payload.name,
        "composite": payload.composite,
        "clientRole": payload.client_role,
        "containerId": payload.container_id
    });

    let client = Client::new();
    let response = client
        .post(&url)
        .header("Authorization", auth.clone())
        .json(&role_body)
        .send()
        .await
        .map_err(|_| actix_web::error::ErrorInternalServerError("Failed to call Keycloak"))?;

    let status = response.status().as_u16();
    match status {
        201 => {
            // Keycloak does not return the created role, so fetch it by name
            let get_url = format!("{}/admin/realms/{}/roles/{}", keycloak_url, realm, payload.name);
            let get_response = client
                .get(&get_url)
                .header("Authorization", auth)
                .send()
                .await
                .map_err(|_| actix_web::error::ErrorInternalServerError("Failed to fetch created role"))?;

            if get_response.status().is_success() {
                let value = get_response.json::<serde_json::Value>().await
                    .map_err(|_| actix_web::error::ErrorInternalServerError("Failed to parse Keycloak response"))?;

                let id = value.get("id").and_then(|v| v.as_str()).unwrap_or("").to_string();
                let name = value.get("name").and_then(|v| v.as_str()).unwrap_or("").to_string();
                let description = value.get("description").and_then(|v| v.as_str()).unwrap_or("").to_string();

                let dto = GetRoleRes { id, name, description };
                Ok(HttpResponse::Created().json(dto))
            } else {
                Ok(HttpResponse::Created().finish())
            }
        }
        409 => {
            let body = response.text().await.unwrap_or_else(|_| "Conflict".to_string());
            Ok(HttpResponse::Conflict().body(body))
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

#[get("/roles/{id}")]
pub async fn get_role(token_req: HttpRequest, path: web::Path<String>) -> Result<impl Responder> {
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

    // Use /roles-by-id/{roleId} endpoint
    let url = format!("{}/admin/realms/{}/roles-by-id/{}", keycloak_url, realm, id);

    let client = Client::new();
    let response = client
        .get(&url)
        .header("Authorization", auth)
        .send()
        .await
        .map_err(|_| actix_web::error::ErrorInternalServerError("Failed to call Keycloak"))?;

    let status = response.status();

    if status.is_success() {
        let value = response.json::<serde_json::Value>().await
            .map_err(|_| actix_web::error::ErrorInternalServerError("Failed to parse Keycloak response"))?;

        let id = value.get("id").and_then(|v| v.as_str()).unwrap_or("").to_string();
        let name = value.get("name").and_then(|v| v.as_str()).unwrap_or("").to_string();
        let description = value.get("description").and_then(|v| v.as_str()).unwrap_or("").to_string();

        let dto = GetRoleRes { id, name, description };
        Ok(HttpResponse::Ok().json(dto))
    } else if status.as_u16() == 404 {
        let body = response.text().await.unwrap_or_else(|_| "Not found".to_string());
        Ok(HttpResponse::NotFound().body(body))
    } else {
        let body = response.text().await.unwrap_or_else(|_| "Could not read error body".to_string());
        Ok(HttpResponse::build(status).body(body))
    }
}

#[get("/roles")]
pub async fn get_all_roles(token_req: HttpRequest) -> Result<impl Responder> {
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

    // Keycloak endpoint for all roles
    let url = format!("{}/admin/realms/{}/roles", keycloak_url, realm);

    let client = Client::new();
    let response = client
        .get(&url)
        .header("Authorization", auth)
        .send()
        .await
        .map_err(|_| actix_web::error::ErrorInternalServerError("Failed to call Keycloak"))?;

    if response.status().is_success() {
        let roles_value = response.json::<Vec<serde_json::Value>>().await
            .map_err(|_| actix_web::error::ErrorInternalServerError("Failed to parse Keycloak response"))?;

        let roles_vec: Vec<GetRoleRes> = roles_value.into_iter().map(|role_value| {
            let id = role_value.get("id").and_then(|v| v.as_str()).unwrap_or("").to_string();
            let name = role_value.get("name").and_then(|v| v.as_str()).unwrap_or("").to_string();
            let description = role_value.get("description").and_then(|v| v.as_str()).unwrap_or("").to_string();

            GetRoleRes { id, name, description }
        }).collect();

        let res = GetAllRolesRes { roles: roles_vec };
        Ok(HttpResponse::Ok().json(res))
    } else {
        let status = response.status();
        let body = response.text().await.unwrap_or_else(|_| "Could not read error body".to_string());
        Ok(HttpResponse::build(status).body(body))
    }
}

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