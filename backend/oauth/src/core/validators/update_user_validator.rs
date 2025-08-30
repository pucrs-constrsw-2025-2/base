use crate::core::dtos::req::update_user_req::UpdateUserReq;
use regex::Regex;

pub fn validate_update_user(req: &UpdateUserReq) -> Result<(), Vec<String>> {
    let mut errors = Vec::new();

    if let Some(username) = &req.username {
        if username.trim().is_empty() {
            errors.push("Username cannot be empty".to_string());
        }
        let email_regex = Regex::new(r#"(?i)^[^@\s]+@[^@\s]+\.[^@\s]+$"#).unwrap();
        if !email_regex.is_match(username) {
            errors.push("Invalid email format".to_string());
        }
    }

    if let Some(first_name) = &req.first_name {
        if first_name.trim().is_empty() {
            errors.push("First name cannot be empty".to_string());
        }
    }

    if let Some(last_name) = &req.last_name {
        if last_name.trim().is_empty() {
            errors.push("Last name cannot be empty".to_string());
        }
    }

    if errors.is_empty() {
        Ok(())
    } else {
        Err(errors)
    }
}