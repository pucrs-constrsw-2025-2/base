use actix_web::{get, App, HttpResponse, HttpServer, Responder};
use std::env;
use dotenv::dotenv;

#[get("/")]
async fn hello() -> impl Responder {
    HttpResponse::Ok().body("Hello, Actix!")
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {

    let env_path = "../.env";
    dotenv::from_filename(env_path).ok();


    for(key, value) in env::vars() {
        println!("{}:{}", key, value);
    }

    let port = env::var("OAUTH_EXTERNAL_API_PORT").expect("not found");
    let host = env::var("OAUTH_INTERNAL_HOST").expect("not found");

    let addr = format!("{}:{}", host, port);

    HttpServer::new(|| {
        App::new()
            .service(hello)
    })
    .bind(addr)?
    .run()
    .await
}
