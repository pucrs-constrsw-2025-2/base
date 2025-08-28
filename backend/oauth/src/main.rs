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
            .service(login)
            .service(create_user)
            .service(get_users)
            .service(get_user)
            .service(update_user)
            .service(patch_user_password)
            .service(delete_user)
            .service(create_role)
            .service(get_role)
            .service(get_all_roles)
            .service(update_role)
    })
    .bind(addr)?
    .run()
    .await
}