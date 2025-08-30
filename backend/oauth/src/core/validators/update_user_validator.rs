use crate::core::dtos::req::create_user_req::CreateUserReq;
use regex::Regex;

pub fn validate_update_user(req: &CreateUserReq) -> Result<(), actix_web::Error> {
    if req.username.trim().is_empty() {
        return Err(actix_web::error::ErrorBadRequest("Email is required"));
    }
    let email_regex = Regex::new(r#"(?i)^[^@\s]+@[^@\s]+\.[^@\s]+$"#)
        .map_err(|_| actix_web::error::ErrorInternalServerError("Failed to compile email regex"))?;
    if !email_regex.is_match(&req.username) {
        return Err(actix_web::error::ErrorBadRequest("Invalid email format"));
    }
    if req.password.trim().is_empty() {
        return Err(actix_web::error::ErrorBadRequest("Password is required"));
    }
    if req.first_name.trim().is_empty() {
        return Err(actix_web::error::ErrorBadRequest("First name is required"));
    }
    if req.last_name.trim().is_empty() {
        return Err(actix_web::error::ErrorBadRequest("Last name is required"));
    }
    Ok(())
}