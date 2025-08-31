/* use actix_web::{test, App, web};
use async_trait::async_trait;

use oauth::adapters::web::controllers::general_controller::login_controller;
use oauth::core::dtos::req::login_req::{LoginReq, LoginReqKeycloak};
use oauth::core::dtos::res::login_res::{LoginRes, LoginResKeycloak};
use oauth::core::error::AppError;
use oauth::core::interfaces::auth_provider::AuthProvider;

// Mock simples injetável
struct MockAuthProvider {
    mode: MockMode,
}
enum MockMode { Ok, InvalidCreds, External }

#[async_trait]
impl AuthProvider for MockAuthProvider {
    async fn login(&self, req: &LoginReqKeycloak) -> Result<LoginResKeycloak, AppError> {
        match self.mode {
            MockMode::Ok => Ok(LoginResKeycloak {
                token_type: "Bearer".into(),
                access_token: format!("TOK-{}", req.username),
                expires_in: 300,
                refresh_token: "REF".into(),
                refresh_expires_in: 900,
            }),
            MockMode::InvalidCreds => Err(AppError::InvalidToken),
            MockMode::External => Err(AppError::ExternalServiceError { details: "kc down".into() }),
        }
    }
}

fn app_with_provider(p: MockAuthProvider) -> App<
    impl actix_web::dev::ServiceFactory<
        actix_web::dev::ServiceRequest,
        Config = (),
        Response = actix_web::dev::ServiceResponse,
        Error = actix_web::Error,
        InitError = ()
    >
> {
    App::new()
        .app_data(web::Data::new(p))
        .service(login_controller)
}

#[actix_rt::test]
async fn login_controller_success() {
    let app = test::init_service(app_with_provider(MockAuthProvider { mode: MockMode::Ok })).await;
    let req = test::TestRequest::post()
        .uri("/login")
        .set_json(&LoginReq {
            username: "user@example.com".into(),
            password: "pass123".into(),
        })
        .to_request();
    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_success());
    let body: serde_json::Value = test::read_body_json(resp).await;
    assert!(body["access_token"].as_str().unwrap().starts_with("TOK-user@example.com"));
}

#[actix_rt::test]
async fn login_controller_validation_error() {
    let app = test::init_service(app_with_provider(MockAuthProvider { mode: MockMode::Ok })).await;
    let req = test::TestRequest::post()
        .uri("/login")
        .set_json(&LoginReq {
            username: "".into(),
            password: "pass123".into(),
        })
        .to_request();
    let resp = test::call_service(&app, req).await;
    assert_eq!(resp.status(), 400);
}

#[actix_rt::test]
async fn login_controller_invalid_credentials() {
    let app = test::init_service(app_with_provider(MockAuthProvider { mode: MockMode::InvalidCreds })).await;
    let req = test::TestRequest::post()
        .uri("/login")
        .set_json(&LoginReq {
            username: "user@example.com".into(),
            password: "wrong".into(),
        })
        .to_request();
    let resp = test::call_service(&app, req).await;
    assert_eq!(resp.status(), 401);
}

#[actix_rt::test]
async fn login_controller_external_error() {
    let app = test::init_service(app_with_provider(MockAuthProvider { mode: MockMode::External })).await;
    let req = test::TestRequest::post()
        .uri("/login")
        .set_json(&LoginReq {
            username: "user@example.com".into(),
            password: "pass123".into(),
        })
        .to_request();
    let resp = test::call_service(&app, req).await;
    assert!(resp.status().is_server_error());
} */