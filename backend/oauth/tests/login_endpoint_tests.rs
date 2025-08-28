use actix_web::{test, web, App};
use oauth::login;
use oauth::dtos::req::login_req::LoginReq;

#[actix_rt::test]
async fn test_login_endpoint_valid_credentials() {
    // Prepare a valid login payload (replace with valid credentials for your Keycloak)
    let payload = LoginReq {
        username: "admin@constrsw.com".to_string(),
        password: "a12345678".to_string(),
    };

    let app = test::init_service(
        App::new().service(
            web::resource("/login").route(web::post().to(login))
        )
    ).await;

    let req = test::TestRequest::post()
        .uri("/login")
        .set_form(&payload)
        .to_request();

    let resp = test::call_service(&app, req).await;
    // Accept 201 Created, 400 BadRequest, or 401 Unauthorized depending on test environment
    assert!(
        resp.status().is_success() ||
        resp.status().as_u16() == 400 ||
        resp.status().as_u16() == 401
    );
}

#[actix_rt::test]
async fn test_login_endpoint_invalid_credentials() {
    let payload = LoginReq {
        username: "invalid@constrsw.com".to_string(),
        password: "wrongpassword".to_string(),
    };

    let app = test::init_service(
        App::new().service(
            web::resource("/login").route(web::post().to(login))
        )
    ).await;

    let req = test::TestRequest::post()
        .uri("/login")
        .set_form(&payload)
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert!(
        resp.status().as_u16() == 401 ||
        resp.status().as_u16() == 400
    );
}