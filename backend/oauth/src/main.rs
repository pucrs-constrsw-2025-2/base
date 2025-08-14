use actix_web::{get, post, web, App, HttpResponse, HttpServer, Responder};
use std::env;
use dotenv::dotenv;

mod dtos;
use dtos::req::login_req::LoginReq;

#[get("/")]
async fn hello() -> impl Responder {
    HttpResponse::Ok().body("Hello, Actix!")
}

#[post("/login")]
async fn login(web::Form(form): web::Form<LoginReq>) -> impl Responder {
    let login_req = form;
    println!("Login request: {:?}", login_req);
    HttpResponse::Ok().body("Login successful")
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {

    let env_path = "../.env";
    dotenv::from_filename(env_path).ok();


    let port = env::var("OAUTH_EXTERNAL_API_PORT").expect("Missing OAUTH_EXTERNAL_API_PORT");
    let host = env::var("OAUTH_INTERNAL_HOST").expect("Missing OAUTH_INTERNAL_HOST");

    let addr = format!("{}:{}", host, port);

    HttpServer::new(|| {
        App::new()
            .service(hello)
    })
    .bind(addr)?
    .run()
    .await
}
