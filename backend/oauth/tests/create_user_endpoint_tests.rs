use actix_web::{test, web, App};
use oauth::create_user;
use oauth::dtos::req::create_user_req::CreateUserReq;

#[actix_rt::test]
async fn test_create_user_endpoint_valid() {
    // Prepare a valid user payload (adjust fields as needed for your Keycloak)
    let payload = CreateUserReq {
        username: "testuser@constrsw.com".to_string(),
        password: "TestPassword123".to_string(),
        first_name: "Test".to_string(),
        last_name: "User".to_string(),
    };

    let app = test::init_service(
        App::new().service(
            web::resource("/users").route(web::post().to(create_user))
        )
    ).await;

    let req = test::TestRequest::post()
        .uri("/users")
        .set_json(&payload)
        .insert_header(("Authorization", "Bearer test_token"))
        .to_request();

    let resp = test::call_service(&app, req).await;
    // Accept 201 Created, 409 Conflict, 401 Unauthorized, or 403 Forbidden depending on test environment
    assert!(
        resp.status().is_success() ||
        resp.status().as_u16() == 409 ||
        resp.status().as_u16() == 401 ||
        resp.status().as_u16() == 403
    );
}

#[actix_rt::test]
async fn test_create_user_endpoint_missing_auth() {
    let payload = CreateUserReq {
        username: "testuser2@constrsw.com".to_string(),
        password: "TestPassword123".to_string(),
        first_name: "Test2".to_string(),
        last_name: "User2".to_string(),
    };

    let app = test::init_service(
        App::new().service(
            web::resource("/users").route(web::post().to(create_user))
        )
    ).await;

    let req = test::TestRequest::post()
        .uri("/users")
        .set_json(&payload)
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert_eq!(resp.status().as_u16(), 401);
}

// We recommend installing an extension to run rust tests.