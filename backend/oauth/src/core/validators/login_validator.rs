use crate::core::dtos::req::login_req::LoginReq;
use regex::Regex;

pub fn validate_login(form: &LoginReq) -> Result<(), Vec<String>> {
    let mut errors = Vec::new();

    if form.username.trim().is_empty() {
        errors.push("Username is required".to_string());
    } else {
        let email_regex = Regex::new(r#"(?i)^(?:[-!#-'*+\/-9=?A-Z^-~]+(?:\.[-!#-'*+\/-9=?A-Z^-~]+)*|"(?:[\x20\x21\x23-\x5b\x5d-\x7e]|\\[\x00-\x7f])*")@(?:[-!#-'*+\/-9=?A-Z^-~]+(?:\.[-!#-'*+\/-9=?A-Z^-~]+)*|\[[\t -Z^-~]*\])$"#)
            .map_err(|_| vec!["Failed to compile email regex".to_string()])?;

        if !email_regex.is_match(&form.username) {
            errors.push("Invalid email format".to_string());
        }
    }

    if form.password.trim().is_empty() {
        errors.push("Password is required".to_string());
    }

    if errors.is_empty() {
        Ok(())
    } else {
        Err(errors)
    }
}