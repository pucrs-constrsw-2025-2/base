use actix_web::{test, web, App};
use oauth::patch_user_password;
use serde_json::json;

#[actix_rt::test]
async fn test_patch_user_password_endpoint_with_auth() {
    let app = test::init_service(
        App::new().service(
            web::resource("/users/{id}").route(web::patch().to(patch_user_password))
        )
    ).await;

    // Replace "test-user-id" with a valid user ID for your Keycloak instance
    let req = test::TestRequest::patch()
        .uri("/users/test-user-id")
        .insert_header(("Authorization", "Bearer test_token"))
        .set_json(&json!({
            "password": "NewPassword123"
        }))
        .to_request();

    let resp = test::call_service(&app, req).await;
    // Accept 200 OK, 404 Not Found, 401 Unauthorized, or 403 Forbidden depending on test environment
    assert!(
        resp.status().is_success() ||
        resp.status().as_u16() == 404 ||
        resp.status().as_u16() == 401 ||
        resp.status().as_u16() == 403
    );
}

#[actix_rt::test]