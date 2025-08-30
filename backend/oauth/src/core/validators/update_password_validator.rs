pub fn validate_update_password(password: &str) -> Result<(), Vec<String>> {
    let mut errors = Vec::new();
    if password.trim().is_empty() {
        errors.push("Password is required".to_string());
    }
    if errors.is_empty() {
        Ok(())
    } else {
        Err(errors)
    }
}