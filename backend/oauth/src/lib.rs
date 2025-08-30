pub mod adapters;
pub mod core;
pub use core::dtos::*;
use actix_web::{get, HttpResponse, Responder};

#[get("/")]
pub async fn hello() -> impl Responder {
    HttpResponse::Ok().body("Hello, Actix!")
}