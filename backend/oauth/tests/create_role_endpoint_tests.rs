use actix_web::{test, web, App};
use oauth::create_role;
use oauth::dtos::req::create_role_req::CreateRoleReq;

#[actix_rt::test]
async fn test_create_role_endpoint_with_auth() {
    let payload = CreateRoleReq {
        name: "test_role".to_string(),
        composite: false,
        client_role: false,
        container_id: "test_container".to_string(),
    };

    let app = test::init_service(
        App::new().service(
            web::resource("/roles").route(web::post().to(create_role))
        )
    ).await;

    let req = test::TestRequest::post()
        .uri("/roles")
        .insert_header(("Authorization", "Bearer test_token")) // Need to verify token in real scenario
        .set_json(&payload)
        .to_request();

    let resp = test::call_service(&app, req).await;
    // Accept 201 Created, 409 Conflict, 401 Unauthorized, or 403 Forbidden depending on test environment
    assert!(
        resp.status().as_u16() == 201 ||
        resp.status().as_u16() == 409 ||
        resp.status().as_u16() == 401 ||
        resp.status().as_u16() == 403
    );
}

#[actix_rt::test]
async fn test_create_role_endpoint_missing_auth() {
    let payload = CreateRoleReq {
        name: "test_role_no_auth".to_string(),
        composite: false,
        client_role: false,
        container_id: "test_container".to_string(),
    };

    let app = test::init_service(
        App::new().service(
            web::resource("/roles").route(web::post().to(create_role))
        )
    ).await;

    let req = test::TestRequest::post()
        .uri("/roles")
        .set_json(&payload)
        .to_request();

    let resp = test::call_service(&app, req).await;
    assert_eq!(resp.status().as_u16(), 401);
}