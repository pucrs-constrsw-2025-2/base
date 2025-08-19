use actix_web::{get, post, web, App, HttpRequest, HttpResponse, HttpServer, Responder, Result};
use serde_json::{json, Value};
use reqwest::Client;
use std::env;
use dotenv::dotenv;

mod dtos;
use dtos::req::login_req::LoginReq;
use dtos::req::login_req::LoginReqKeycloak;
use dtos::res::login_res::LoginResKeycloak;
use dtos::res::login_res::LoginRes;

#[get("/")]
async fn hello() -> impl Responder {
    
    HttpResponse::Ok().body("Hello, Actix!")
}

#[post("/login")]
async fn login(web::Form(form): web::Form<LoginReq>) -> Result<impl Responder> {
    println!("Login attempt for user: {}", form.username);

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
    let grant_type = env::var("KEYCLOAK_GRANT_TYPE")
        .map_err(|_| actix_web::error::ErrorInternalServerError("Missing KEYCLOAK_GRANT_TYPE"))?;

    let url = format!("{}/realms/{}/protocol/openid-connect/token", keycloak_url, realm);

    let keycloak_request = LoginReqKeycloak {
        client_id,
        client_secret,
        username: form.username,
        password: form.password,
        grant_type,
    };

    let client = Client::new();

    let response = client.post(&url).form(&keycloak_request).send().await
        .map_err(|_| actix_web::error::ErrorInternalServerError("Failed to connect to Keycloak"))?;

    if response.status().is_success() {
        let keycloak_response = response.json::<LoginResKeycloak>().await
            .map_err(|_| actix_web::error::ErrorInternalServerError("Failed to parse Keycloak response"))?;
        Ok(HttpResponse::Ok().json(keycloak_response))
    } else {
        let status = response.status();
        let error_body = response.text().await.unwrap_or_else(|_| "Could not read error body".to_string());
        
        println!("Keycloak error response: status={}, body={}", status, error_body);

        Ok(HttpResponse::build(status).body(error_body))
    }
}

#[post("/users")]
async fn create_user(token_req: HttpRequest, web::Json(payload): web::Json<Value>) -> Result<impl Responder> {
    // Require Authorization
    let auth = match token_req.headers().get("Authorization").and_then(|v| v.to_str().ok()) {
        Some(s) if !s.is_empty() => s.to_string(),
        _ => return Ok(HttpResponse::Unauthorized().body("Missing Authorization header")),
    };

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
    
    // Creates HTTP Client and request
    let client = Client::new();
    let response = client
        .post(&url)
        .header("Authorization", auth)
        .json(&payload)
        .send()
        .await
        .map_err(|_| actix_web::error::ErrorInternalServerError("Failed to call Keycloak"))?;

    // Parse response
    if response.status().as_u16() == 201 {
        // Keycloak returns Location header with created user id; extra safe parse
        if let Some(loc) = response.headers().get("Location").and_then(|v| v.to_str().ok()) {
            let id = loc.rsplit('/').next().unwrap_or(loc);
            let body = json!({ "id": id, "user": payload });
            Ok(HttpResponse::Created().json(body))
        } else {
            Ok(HttpResponse::Created().json(payload))
        }
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

    let oauth_client_id = env::var("KEYCLOAK_CLIENT_ID").expect("Missing KEYCLOAK_CLIENT_ID");
    let oauth_secret = env::var("KEYCLOAK_CLIENT_SECRET").expect("Missing KEYCLOAK_CLIENT_SECRET");


    HttpServer::new(|| {
        App::new()
            .service(hello)
            .service(login)
            .service(create_user)
    })
    .bind(addr)?
    .run()
    .await
}
