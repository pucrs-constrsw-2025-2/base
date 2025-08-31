use crate::adapters::web::controllers::general_controller::login_controller;
use crate::adapters::web::controllers::user_controller::{create_user_controller, get_users_controller, get_user_controller, 
                                                        update_user_controller, update_password_controller, delete_user_controller,
                                                        add_role_to_user_controller, remove_role_from_user_controller};
use crate::adapters::web::controllers::role_controller::{get_roles_controller, get_role_controller, create_role_controller,
                                                         update_role_controller, patch_role_controller, delete_role_controller};
use actix_web::{App, HttpServer};
use dotenv::dotenv;
use std::env;
use oauth::*; 

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv().ok();

    let port = env::var("OAUTH_EXTERNAL_API_PORT").expect("Missing OAUTH_EXTERNAL_API_PORT");
    let host = env::var("OAUTH_INTERNAL_HOST").expect("Missing OAUTH_INTERNAL_HOST");
    let addr = format!("{}:{}", host, port);

    HttpServer::new(|| {
        App::new()
            .service(hello)
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