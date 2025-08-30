pub mod adapters;
pub mod core;
pub use core::dtos::*;
use actix_web::{get, post, put, web, HttpRequest, HttpResponse, Responder, Result};
use reqwest::Client;
use std::env;

//ROLES
use core::dtos::req::create_role_req::CreateRoleReq;
use core::dtos::res::get_role_res::GetRoleRes;
use core::dtos::res::get_all_roles_res::GetAllRolesRes;

#[get("/")]
pub async fn hello() -> impl Responder {
    
    HttpResponse::Ok().body("Hello, Actix!")
}