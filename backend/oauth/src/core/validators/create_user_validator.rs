use crate::core::dtos::req::create_user_req::CreateUserReq;
use regex::Regex;

pub fn validate_create_user(req: &CreateUserReq) -> Result<(), actix_web::Error> {
    if req.username.trim().is_empty() || req.password.trim().is_empty() {
        return Err(actix_web::error::ErrorBadRequest("Username and password required"));
    }
    let email_regex = Regex::new(r#"(?i)^(?:[-!#-'*+\/-9=?A-Z^-~]+(?:\.[-!#-'*+\/-9=?A-Z^-~]+)*|"(?:[\x20\x21\x23-\x5b\x5d-\x7e]|\\[\x00-\x7f])*")@(?:[-!#-'*+\/-9=?A-Z^-~]+(?:\.[-!#-'*+\/-9=?A-Z^-~]+)*|\[[\t -Z^-~]*\])$"#)
        .map_err(|_| actix_web::error::ErrorInternalServerError("Failed to compile email regex"))?;
    if !email_regex.is_match(&req.username) {
        return Err(actix_web::error::ErrorBadRequest("Invalid email"));
    }
    Ok(())
}