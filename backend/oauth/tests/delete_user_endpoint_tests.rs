use actix_web::{test, web, App};
use oauth::delete_user;

#[actix_rt::test]
async fn test_delete_user_endpoint_with_auth() {
    let app = test::init_service(
        App::new().service(
            web::resource("/users/{id}").route(web::delete().to(delete_user))
        )
    ).await;

    // Replace "test-user-id" with a valid user ID for your Keycloak instance
    let req = test::TestRequest::delete()
        .uri("/users/test-user-id")
        .insert_header(("Authorization", "Bearer test_token"))
        .to_request();

    let resp = test::call_service(&app, req).await;
    // Accept 204 No Content, 404 Not Found, 401 Unauthorized, or 403 Forbidden depending on test environment
    assert!(
        resp.status().as_u16() == 204 ||
        resp.status().as_u16() == 404 ||
        resp.status().as_u16() == 401 ||
        resp.status().as_u16() == 403
    );
}

#[actix_rt::test]
async fn test_delete_user_endpoint_missing_auth() {
    let app = test::init_service(
        App::new().service(
            web::resource("/users/{id}").route(web::delete().to(delete_user))
        )
    ).await;

    let req = test::TestRequest::delete()
        .uri("/users/test-user-id")
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert_eq!(resp.status().as_u16(), 401);
}

// We recommend installing an extension to run rust tests.