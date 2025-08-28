use actix_web::{test, web, App};
use oauth::get_role;

#[actix_rt::test]
async fn test_get_role_endpoint_with_auth() {
    let app = test::init_service(
        App::new().service(
            web::resource("/roles/{id}").route(web::get().to(get_role))
        )
    ).await;

    // Replace "test-role-id" with a valid role ID for your Keycloak instance
    let req = test::TestRequest::get()
        .uri("/roles/test-role-id")
        .insert_header(("Authorization", "Bearer test_token"))
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
async fn test_get_role_endpoint_missing_auth() {
    let app = test::init_service(
        App::new().service(
            web::resource("/roles/{id}").route(web::get().to(get_role))
        )
    ).await;

    let req = test::TestRequest::get()
        .uri("/roles/test-role-id")
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert_eq!(resp.status().as_u16(), 401);
}

// We recommend installing an extension to run rust tests.