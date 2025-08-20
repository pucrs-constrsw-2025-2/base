use actix_web::{delete, get, patch, post, put, web, App, HttpRequest, HttpResponse, HttpServer, Responder, Result};
use serde_json::{json, Value};
use reqwest::Client;
use regex::Regex;
use std::env;
use dotenv::dotenv;

mod dtos;
//USERS
use dtos::req::login_req::LoginReq;
use dtos::req::login_req::LoginReqKeycloak;
use dtos::res::login_res::LoginResKeycloak;
use dtos::res::login_res::LoginRes;
use dtos::req::create_user_req::CreateUserReq;
use dtos::res::create_user_res::CreateUserRes;
use dtos::res::get_user_res::GetUserRes;
use dtos::res::get_all_users_res::GetUsersRes;
//ROLES
use dtos::res::get_role_res::GetRoleRes;
use dtos::res::get_all_roles_res::GetAllRolesRes;

#[get("/")]
async fn hello() -> impl Responder {
    
    HttpResponse::Ok().body("Hello, Actix!")
}
//USERS
#[post("/login")]
async fn login(web::Form(form): web::Form<LoginReq>) -> Result<impl Responder> {
    println!("Login attempt for user: {}", form.username);

    // Build Keycloak base URL from environment
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

    let client_id = env::var("KEYCLOAK_CLIENT_ID")
        .map_err(|_| actix_web::error::ErrorInternalServerError("Missing KEYCLOAK_CLIENT_ID"))?;
    let client_secret = env::var("KEYCLOAK_CLIENT_SECRET")
        .map_err(|_| actix_web::error::ErrorInternalServerError("Missing KEYCLOAK_CLIENT_SECRET"))?;

    // Token endpoint per Keycloak spec
    let url = format!("{}/realms/{}/protocol/openid-connect/token", keycloak_url, realm);

    let keycloak_request = LoginReqKeycloak {
        client_id,
        client_secret,
        username: form.username.clone(),
        password: form.password.clone(),
        grant_type: "password".to_string(),
    };

    let client = Client::new();
    let response = client
        .post(&url)
        .form(&keycloak_request)
        .send()
        .await
        .map_err(|_| actix_web::error::ErrorInternalServerError("Failed to connect to Keycloak"))?;

    let status = response.status();

    if status.is_success() {
        let keycloak_response = response.json::<LoginResKeycloak>().await
            .map_err(|_| actix_web::error::ErrorInternalServerError("Failed to parse Keycloak response"))?;

        let res = LoginRes {
            token_type: keycloak_response.token_type,
            access_token: keycloak_response.access_token,
            expires_in: keycloak_response.expires_in.try_into().unwrap_or(0),
            refresh_token: keycloak_response.refresh_token,
            refresh_expires_in: keycloak_response.refresh_expires_in.try_into().unwrap_or(0),
        };

        // 201 Created per spec
        Ok(HttpResponse::Created().json(res))
    } else {
        let error_body = response.text().await.unwrap_or_else(|_| "Could not read error body".to_string());
        match status.as_u16() {
            400 => Ok(HttpResponse::BadRequest().body(error_body)),
            401 => Ok(HttpResponse::Unauthorized().body(error_body)),
            s => Ok(HttpResponse::build(status).body(error_body)),
        }
    }
}

#[post("/users")]
async fn create_user(token_req: HttpRequest, web::Json(payload): web::Json<CreateUserReq>) -> Result<impl Responder> {
    // Require Authorization
    let auth = match token_req.headers().get("Authorization").and_then(|v| v.to_str().ok()) {
        Some(s) if !s.is_empty() => s.to_string(),
        _ => return Ok(HttpResponse::Unauthorized().body("Missing Authorization header")),
    };

    // Serialize DTO so we can access fields even if they are not `pub`
    let payload_value = serde_json::to_value(&payload)
        .map_err(|_| actix_web::error::ErrorBadRequest("Invalid request payload"))?;

    // Extract fields
    let username = payload_value.get("username")
        .and_then(|v| v.as_str())
        .map(|s| s.to_string())
        .ok_or_else(|| actix_web::error::ErrorBadRequest("Missing username"))?;

    let password = payload_value.get("password")
        .and_then(|v| v.as_str())
        .map(|s| s.to_string())
        .ok_or_else(|| actix_web::error::ErrorBadRequest("Missing password"))?;

    // firstName may be sent as "firstName" or "first_name" etc.
    let first_name = payload_value.get("firstName")
        .or_else(|| payload_value.get("first_name"))
        .and_then(|v| v.as_str())
        .map(|s| s.to_string())
        .unwrap_or_default();

    let last_name = payload_value.get("lastName")
        .or_else(|| payload_value.get("last_name"))
        .and_then(|v| v.as_str())
        .map(|s| s.to_string())
        .unwrap_or_default();

    // Validate email (username must be a valid email per spec)
    // Add dependency: regex = "1"
    let email_regex = Regex::new(r#"(?i)^(?:[-!#-'*+\/-9=?A-Z^-~]+(?:\.[-!#-'*+\/-9=?A-Z^-~]+)*|"(?:[\x20\x21\x23-\x5b\x5d-\x7e]|\\[\x00-\x7f])*")@(?:[-!#-'*+\/-9=?A-Z^-~]+(?:\.[-!#-'*+\/-9=?A-Z^-~]+)*|\[[\t -Z^-~]*\])$"#)
        .map_err(|_| actix_web::error::ErrorInternalServerError("Failed to compile email regex"))?;

    if !email_regex.is_match(&username) {
        return Ok(HttpResponse::BadRequest().body("Invalid email"));
    }

    // Configure routes
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
    let url = format!("{}/admin/realms/{}/users", keycloak_url, realm);

    // Build Keycloak-compatible body (include credentials so password is set)
    let user_body = json!({
        "username": username,
        "email": username,
        "firstName": first_name,
        "lastName": last_name,
        "enabled": true,
        "credentials": [
            {
                "type": "password",
                "value": password,
                "temporary": false
            }
        ]
    });

    // Creates HTTP Client and request
    let client = Client::new();
    let response = client
        .post(&url)
        .header("Authorization", auth)
        .json(&user_body)
        .send()
        .await
        .map_err(|_| actix_web::error::ErrorInternalServerError("Failed to call Keycloak"))?;

    // Map responses
    let status = response.status().as_u16();
    match status {
        201 => {
            // Keycloak returns Location header with created user id
            let id = response
                .headers()
                .get("Location")
                .and_then(|v| v.to_str().ok())
                .and_then(|loc| loc.rsplit('/').next())
                .map(|s| s.to_string())
                .unwrap_or_default();

            let res = CreateUserRes {
                id,
                username: username.clone(),
                first_name,
                last_name,
                enabled: true,
            };
            Ok(HttpResponse::Created().json(res))
        }
        409 => {
            // Conflict: username already exists
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
            // pass through other statuses (400, 500, etc.)
            let body = response.text().await.unwrap_or_else(|_| "Could not read error body".to_string());
            Ok(HttpResponse::build(actix_web::http::StatusCode::from_u16(s).unwrap()).body(body))
        }
    }
}

#[get("/users")]
async fn get_users(token_req: HttpRequest) -> Result<impl Responder> {
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

    // Query Keycloak admin users endpoint (only enabled users)
    let url = format!("{}/admin/realms/{}/users?enabled=true", keycloak_url, realm);

    let client = Client::new();
    let response = client
        .get(&url)
        .header("Authorization", auth)
        .send()
        .await
        .map_err(|_| actix_web::error::ErrorInternalServerError("Failed to call Keycloak"))?;

    if response.status().is_success() {
        // Parse body as JSON array and map each entry to GetUserRes
        let users_value = response.json::<Vec<Value>>().await
            .map_err(|_| actix_web::error::ErrorInternalServerError("Failed to parse Keycloak response"))?;

        let users_vec: Vec<GetUserRes> = users_value.into_iter().map(|user_value| {
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

            GetUserRes {
                id,
                username,
                first_name,
                last_name,
                enabled,
            }
        }).collect();

        let res = GetUsersRes { users: users_vec };
        Ok(HttpResponse::Ok().json(res))
    } else {
        let status = response.status();
        let body = response.text().await.unwrap_or_else(|_| "Could not read error body".to_string());
        Ok(HttpResponse::build(status).body(body))
    }
}

#[get("/users/{id}")]
async fn get_user(token_req: HttpRequest, path: web::Path<String>) -> Result<impl Responder> {

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
async fn update_user(
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
async fn patch_user_password(
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
async fn delete_user(token_req: HttpRequest, path: web::Path<String>) -> Result<impl Responder> {
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
#[get("/roles/{id}")]
async fn get_role(token_req: HttpRequest, path: web::Path<String>) -> Result<impl Responder> {
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

    // Keycloak role endpoint
    let url = format!("{}/admin/realms/{}/roles/{}", keycloak_url, realm, id);

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
async fn get_all_roles(token_req: HttpRequest) -> Result<impl Responder> {
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

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv::dotenv().ok();

    let port = env::var("OAUTH_EXTERNAL_API_PORT").expect("Missing OAUTH_EXTERNAL_API_PORT");
    let host = env::var("OAUTH_INTERNAL_HOST").expect("Missing OAUTH_INTERNAL_HOST");

    let addr = format!("{}:{}", host, port);


    HttpServer::new(|| {
        App::new()
            .service(hello)
            .service(login)
            .service(create_user)
            .service(get_users)
            .service(get_user)
            .service(update_user)
            .service(patch_user_password)
            .service(delete_user)
            .service(get_role)
            .service(get_all_roles)
    })
    .bind(addr)?
    .run()
    .await
}
