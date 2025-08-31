use actix_web::{App, HttpServer};
use dotenv::dotenv;
use std::env;

use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;
use utoipa::openapi::security::{HttpAuthScheme, Http, SecurityScheme};

use oauth::adapters::web::controllers::general_controller::login_controller;
use oauth::adapters::web::controllers::user_controller::{
    create_user_controller, get_users_controller, get_user_controller,
    update_user_controller, update_password_controller, delete_user_controller,
    add_role_to_user_controller, remove_role_from_user_controller, PasswordUpdateReq
};
use oauth::adapters::web::controllers::role_controller::{
    get_roles_controller, get_role_controller, create_role_controller,
    update_role_controller, patch_role_controller, delete_role_controller
};

use oauth::core::dtos::req::{
    login_req::LoginReq,
    create_user_req::CreateUserReq,
    update_user_req::UpdateUserReq,
    assign_role_req::AssignRoleReq,
    create_role_req::CreateRoleReq,
    update_role_partial_req::UpdateRolePartialReq,
};
use oauth::core::dtos::res::{
    login_res::LoginResKeycloak,
    create_user_res::CreateUserRes,
    get_user_res::GetUserRes,
    get_all_users_res::GetUsersRes,
    get_role_res::GetRoleRes,
    get_all_roles_res::GetAllRolesRes,
};

struct SecurityAddon;

impl utoipa::Modify for SecurityAddon {
    fn modify(&self, openapi: &mut utoipa::openapi::OpenApi) {
        if openapi.components.is_none() {
            openapi.components = Some(utoipa::openapi::Components::new());
        }
        if let Some(components) = openapi.components.as_mut() {
            let mut http = Http::new(HttpAuthScheme::Bearer);
            http.bearer_format = Some("JWT".to_string());
            components.add_security_scheme(
                "bearerAuth",
                SecurityScheme::Http(http),
            );
        }
    }
}

#[derive(OpenApi)]
#[openapi(
    paths(
        oauth::adapters::web::controllers::general_controller::login_controller,
        oauth::adapters::web::controllers::user_controller::create_user_controller,
        oauth::adapters::web::controllers::user_controller::get_users_controller,
        oauth::adapters::web::controllers::user_controller::get_user_controller,
        oauth::adapters::web::controllers::user_controller::update_user_controller,
        oauth::adapters::web::controllers::user_controller::update_password_controller,
        oauth::adapters::web::controllers::user_controller::delete_user_controller,
        oauth::adapters::web::controllers::user_controller::add_role_to_user_controller,
        oauth::adapters::web::controllers::user_controller::remove_role_from_user_controller,
        oauth::adapters::web::controllers::role_controller::create_role_controller,
        oauth::adapters::web::controllers::role_controller::get_roles_controller,
        oauth::adapters::web::controllers::role_controller::get_role_controller,
        oauth::adapters::web::controllers::role_controller::update_role_controller,
        oauth::adapters::web::controllers::role_controller::patch_role_controller,
        oauth::adapters::web::controllers::role_controller::delete_role_controller
    ),
    components(
        schemas(
            LoginReq,
            LoginResKeycloak,
            CreateUserReq,
            UpdateUserReq,
            AssignRoleReq,
            PasswordUpdateReq,
            CreateUserRes,
            GetUserRes,
            GetUsersRes,
            CreateRoleReq,
            UpdateRolePartialReq,
            GetRoleRes,
            GetAllRolesRes
        )
    ),
    security( ("bearerAuth" = []) ),
    modifiers(&SecurityAddon),
    tags(
        (name = "general", description = "Operações gerais"),
        (name = "users", description = "Gestão de usuários"),
        (name = "roles", description = "Gestão de roles")
    )
)]
pub struct ApiDoc;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();

    let openapi = ApiDoc::openapi();

    let port = env::var("OAUTH_EXTERNAL_API_PORT").expect("Missing OAUTH_EXTERNAL_API_PORT");
    let host = env::var("OAUTH_INTERNAL_HOST").expect("Missing OAUTH_INTERNAL_HOST");
    let addr = format!("{host}:{port}");

    HttpServer::new(move || {
        let spec = openapi.clone();
        App::new()
            .service(
                SwaggerUi::new("/swagger-ui/{_:.*}")
                    .url("/api-docs/openapi.json", spec)
            )
            .service(login_controller)
            .service(create_user_controller)
            .service(get_users_controller)
            .service(get_user_controller)
            .service(update_user_controller)
            .service(update_password_controller)
            .service(delete_user_controller)
            .service(create_role_controller)
            .service(get_role_controller)
            .service(get_roles_controller)
            .service(update_role_controller)
            .service(patch_role_controller)
            .service(delete_role_controller)
            .service(add_role_to_user_controller)
            .service(remove_role_from_user_controller)
    })
    .bind(addr)?
    .run()
    .await
}