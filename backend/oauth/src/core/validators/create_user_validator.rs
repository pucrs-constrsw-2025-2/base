use crate::core::dtos::req::create_user_req::CreateUserReq;
use regex::Regex;

pub fn validate_create_user(req: &CreateUserReq) -> Result<(), Vec<String>> {
    let mut errors = Vec::new();

    if req.username.trim().is_empty() {
        errors.push("Username is required".to_string());
    } else {
        let email_regex = Regex::new(r#"(?i)^[^@\s]+@[^@\s]+\.[^@\s]+$"#).unwrap();
        if !email_regex.is_match(&req.username) {
            errors.push("Invalid email format".to_string());
        }
    }

    if req.password.trim().is_empty() {
        errors.push("Password is required".to_string());
    }

    if req.first_name.trim().is_empty() {
        errors.push("First name is required".to_string());
    }

    if req.last_name.trim().is_empty() {
        errors.push("Last name is required".to_string());
    }

    if errors.is_empty() {
        Ok(())
    } else {
        Err(errors)
    }
}